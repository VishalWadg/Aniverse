package com.vvw.AniverseBackend.service;

import java.time.Instant;
import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import com.vvw.AniverseBackend.entity.Feedback;
import com.vvw.AniverseBackend.entity.PendingJob;
import com.vvw.AniverseBackend.entity.type.JobStatus;
import com.vvw.AniverseBackend.entity.type.JobType;
import com.vvw.AniverseBackend.event.JobEnqueuedEvent;
import com.vvw.AniverseBackend.repository.PendingJobRepository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class JobWorkerService {
    private final PendingJobRepository pendingJobRepository;
    private final FeedbackService feedbackService;
    private final FeedbackGroupingService feedbackGroupingService;
    private final AiEmbeddingService aiEmbeddingService;
    private final AdminFeedbackService adminFeedbackService;
    private static final List<String> SUPPORTED_JOB_TYPES = List.of(
        JobType.EMBED_FEEDBACK.name(), 
        JobType.CREATE_GITHUB_ISSUE.name()
    );
    @PersistenceContext
    private EntityManager entityManager;

    @Scheduled(fixedDelay = 5000)
    public void pollAndProcess() {
        List<PendingJob> jobs = pendingJobRepository.claimNextPendingJobs(SUPPORTED_JOB_TYPES, 5);
        jobs.forEach(this::dispatchJob);
    }

    private void dispatchJob(PendingJob job) {
        try {
            switch (job.getJobType()) {
                case EMBED_FEEDBACK -> processEmbedFeedbackJob(job);
                case CREATE_GITHUB_ISSUE -> processCreateGithubIssueJob(job);
                default -> throw new IllegalStateException("Claimed an unsupported job type: " + job.getJobType());
            }
            job.setStatus(JobStatus.COMPLETED);
            pendingJobRepository.save(job);
        } catch (Exception e) {
            log.error("Job {} ({}) failed", job.getId(), job.getJobType(), e);
            job.setAttemptCount(job.getAttemptCount() + 1);
            job.setLastError(e.getMessage());
            if (job.getAttemptCount() >= 5) {
                job.setStatus(JobStatus.FAILED);

            } else {
                job.setNextAttemptAt(calculateNextAttemptAt(job.getAttemptCount()));
                job.setStatus(JobStatus.PENDING);
            }
            pendingJobRepository.save(job);
        }
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onJobEnqueued(JobEnqueuedEvent event) {
        pollAndProcess();
    }

    public void processEmbedFeedbackJob(PendingJob job) {
        Feedback feedback = feedbackService.getFeedbackById(job.getReferenceId());
        float[] embedding = aiEmbeddingService.generateEmbedding(feedback.getContent());
        feedbackGroupingService.assignFeedbackToGroup(feedback.getId(), embedding);
    }

    private Instant calculateNextAttemptAt(int attemptCount) {
        int exponent = Math.max(0, attemptCount - 1);
        long delaySeconds = (long) Math.min(Math.pow(2, exponent) * 5, 3600);
        return Instant.now().plusSeconds(delaySeconds);
    }

    @Scheduled(fixedDelay = 60000) // Runs every 1 minute
    public void recoverStuckJobs() {
        int recovered = pendingJobRepository.resetStuckProcessingJobs();
        if (recovered > 0) {
            log.warn("Recovered {} stuck PROCESSING jobs back to PENDING", recovered);
        }
    }

    private void processCreateGithubIssueJob(PendingJob job){
        adminFeedbackService.createGithubIssueForGroup(job.getReferenceId());
    }
}
