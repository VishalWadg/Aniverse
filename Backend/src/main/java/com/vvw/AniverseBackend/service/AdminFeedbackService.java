package com.vvw.AniverseBackend.service;

import java.util.List;
import java.util.UUID;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.vvw.AniverseBackend.client.GithubClient;
import com.vvw.AniverseBackend.dto.ApproveGroupRequestDto;
import com.vvw.AniverseBackend.dto.FeedbackGroupResponseDto;
import com.vvw.AniverseBackend.dto.MoveFeedbackRequestDto;
import com.vvw.AniverseBackend.dto.internal.GithubIssueResponseDto;
import com.vvw.AniverseBackend.entity.Feedback;
import com.vvw.AniverseBackend.entity.FeedbackGroup;
import com.vvw.AniverseBackend.entity.PendingJob;
import com.vvw.AniverseBackend.entity.Tag;
import com.vvw.AniverseBackend.entity.type.FeedbackGroupStatus;
import com.vvw.AniverseBackend.entity.type.JobStatus;
import com.vvw.AniverseBackend.entity.type.JobType;
import com.vvw.AniverseBackend.event.JobEnqueuedEvent;
import com.vvw.AniverseBackend.exceptions.EntityNotFoundException;
import com.vvw.AniverseBackend.exceptions.InvalidOperationException;
import com.vvw.AniverseBackend.mapper.FeedbackGroupMapper;
import com.vvw.AniverseBackend.repository.FeedbackGroupRepository;
import com.vvw.AniverseBackend.repository.FeedbackRepository;
import com.vvw.AniverseBackend.repository.PendingJobRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class AdminFeedbackService {

    private final FeedbackGroupRepository feedbackGroupRepository;
    private final ApplicationEventPublisher eventPublisher;
    private final FeedbackRepository feedbackRepository;
    private final FeedbackGroupMapper feedbackGroupMapper;
    private final PendingJobRepository pendingJobRepository;
    private final GithubClient githubClient;

    @Transactional(readOnly = true)
    public Page<FeedbackGroupResponseDto> getGroups(FeedbackGroupStatus status, Pageable pageable) {
        return feedbackGroupRepository.findGroupsByStatusWithImpactCount(status, pageable)
                .map(feedbackGroupMapper::toDto);
    }

    @Transactional
    public FeedbackGroupResponseDto approveGroup(UUID groupId, ApproveGroupRequestDto dto) {
        FeedbackGroup group = findGroupOrThrow(groupId);
        if (group.getStatus() != FeedbackGroupStatus.PENDING) {
            throw new InvalidOperationException("Only PENDING feedback groups can be approved.");
        }
        group.setStatus(FeedbackGroupStatus.AWAITING_ISSUE);
        group.setTitle(dto.title());
        PendingJob pendingJob = PendingJob.builder()
                .jobType(JobType.CREATE_GITHUB_ISSUE)
                .status(JobStatus.PENDING)
                .referenceId(group.getId())
                .build();
        FeedbackGroup savedGroup = feedbackGroupRepository.save(group);
        pendingJobRepository.save(pendingJob);
        eventPublisher.publishEvent(new JobEnqueuedEvent());
        return feedbackGroupMapper.toDto(savedGroup);
    }

    @Transactional
    public FeedbackGroupResponseDto discardGroup(UUID groupId) {
        FeedbackGroup group = findGroupOrThrow(groupId);
        if (group.getStatus() != FeedbackGroupStatus.PENDING) {
            throw new InvalidOperationException("Only PENDING feedback groups can be discarded.");
        }
        group.setStatus(FeedbackGroupStatus.DISCARDED);
        FeedbackGroup savedGroup = feedbackGroupRepository.save(group);
        return feedbackGroupMapper.toDto(savedGroup);
    }

    @Transactional
    public FeedbackGroupResponseDto restoreGroup(UUID groupId) {
        FeedbackGroup group = findGroupOrThrow(groupId);
        if (group.getStatus() != FeedbackGroupStatus.DISCARDED) {
            throw new InvalidOperationException("Only DISCARDED feedback groups can be restored to PENDING.");
        }
        group.setStatus(FeedbackGroupStatus.PENDING);
        FeedbackGroup savedGroup = feedbackGroupRepository.save(group);
        return feedbackGroupMapper.toDto(savedGroup);
    }

    @Transactional
    public void moveFeedback(UUID feedbackId, MoveFeedbackRequestDto dto) {
        Feedback feedback = feedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new EntityNotFoundException("Feedback not found with id: " + feedbackId));
        FeedbackGroup oldGroup = feedback.getGroup();
        // Step 1: Attach to target group or create new group
        if (Boolean.TRUE.equals(dto.createNewGroup())) {
            FeedbackGroup newGroup = FeedbackGroup.builder()
                    .title(feedback.getContent().substring(0, Math.min(feedback.getContent().length(), 255)))
                    .representativeEmbedding(feedback.getEmbedding())
                    .status(FeedbackGroupStatus.PENDING)
                    .build();
            newGroup = feedbackGroupRepository.save(newGroup);
            feedback.setGroup(newGroup);
        } else if (dto.targetGroupId() != null) {
            FeedbackGroup targetGroup = findGroupOrThrow(dto.targetGroupId());
            feedback.setGroup(targetGroup);
        } else {
            throw new InvalidOperationException("Must specify targetGroupId or set createNewGroup to true.");
        }
        feedbackRepository.save(feedback);
        // Step 2: Handle oldGroup cleanup and representative embedding reassignment
        if (oldGroup != null) {
            List<Feedback> remaining = oldGroup.getFeedbacks().stream()
                    .filter(f -> !f.getId().equals(feedbackId))
                    .toList();
            if (remaining.isEmpty()) {
                // FR-11: Delete group if 0 members remain
                feedbackGroupRepository.delete(oldGroup);
                log.info("Deleted empty FeedbackGroup {}", oldGroup.getId());
            } else {
                // FR-12: Reassign representative embedding to oldest remaining member if needed
                Feedback oldestRemaining = remaining.get(0);
                oldGroup.setRepresentativeEmbedding(oldestRemaining.getEmbedding());
                feedbackGroupRepository.save(oldGroup);
            }
        }
    }

    private FeedbackGroup findGroupOrThrow(UUID id) {
        return feedbackGroupRepository
                .findById(id)
                .orElseThrow(() -> new EntityNotFoundException("FeedbackGroup not found with id: " + id));
    }

    @Transactional
    public void createGithubIssueForGroup(UUID groupId) {
        FeedbackGroup group = findGroupOrThrow(groupId);
        // 1. Idempotency Check: Skip GitHub API if issue already exists
        if (group.getGithubIssueNumber() != null) {
            group.setStatus(FeedbackGroupStatus.APPROVED);
            feedbackGroupRepository.save(group);
            return;
        }
        // 2. Extract unique labels from all tags across feedbacks in this group
        List<String> labels = group.getFeedbacks().stream()
                .filter(f -> f.getTags() != null)
                .flatMap(f -> f.getTags().stream())
                .map(Tag::getName)
                .distinct()
                .toList();
        // 3. Format the Markdown issue body from the feedbacks
        StringBuilder bodyBuilder = new StringBuilder();
        bodyBuilder.append("## Feedback Summary\n\n");
        bodyBuilder.append("**Group Title:** ").append(group.getTitle()).append("\n\n");
        bodyBuilder.append("### Reported Feedbacks:\n");
        List<Feedback> feedbacks = group.getFeedbacks();
        if (feedbacks != null && !feedbacks.isEmpty()) {
            for (int i = 0; i < feedbacks.size(); i++) {
                Feedback f = feedbacks.get(i);
                bodyBuilder.append("\n#### Report #").append(i + 1).append("\n");
                bodyBuilder.append(f.getContent()).append("\n");
                if (f.getAttachments() != null && !f.getAttachments().isEmpty()) {
                    bodyBuilder.append("\n**Attachments:**\n");
                    for (String attachmentUrl : f.getAttachments()) {
                        bodyBuilder.append("- ").append(attachmentUrl).append("\n");
                    }
                }
            }
        } else {
            bodyBuilder.append("_No detailed feedback items attached._\n");
        }
        // 4. Create Issue via GitHub Client
        GithubIssueResponseDto issueResponse = githubClient.createIssue(
                group.getTitle(),
                bodyBuilder.toString(),
                labels);
        // 5. Persist GitHub Issue details and mark APPROVED
        group.setGithubIssueNumber(issueResponse.number());
        group.setGithubIssueUrl(issueResponse.html_url());
        group.setStatus(FeedbackGroupStatus.APPROVED);
        feedbackGroupRepository.save(group);
    }

}
