package com.vvw.AniverseBackend.service;

import com.vvw.AniverseBackend.dto.FeedbackRequestDto;
import com.vvw.AniverseBackend.dto.FeedbackResponseDto;
import com.vvw.AniverseBackend.entity.Feedback;
import com.vvw.AniverseBackend.entity.PendingJob;
import com.vvw.AniverseBackend.entity.Tag;
import com.vvw.AniverseBackend.entity.type.JobStatus;
import com.vvw.AniverseBackend.entity.type.JobType;
import com.vvw.AniverseBackend.event.JobEnqueuedEvent;
import com.vvw.AniverseBackend.mapper.FeedbackMapper;
import com.vvw.AniverseBackend.repository.FeedbackRepository;
import com.vvw.AniverseBackend.repository.PendingJobRepository;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.vvw.AniverseBackend.mapper.TagMapper;

import java.util.HashSet;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final TagService tagService;
    private final FeedbackMapper feedbackMapper;
    private final TagMapper tagMapper;
    private final PendingJobRepository pendingJobRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public FeedbackResponseDto createFeedback(FeedbackRequestDto dto) {
        Feedback feedback = new Feedback();
        feedback.setContent(dto.getContent());
        feedback.setAttachments(dto.getAttachments());

        // Process Tags: Only allow pre-populated tags based on exact name match
        if (dto.getTagIds() != null && !dto.getTagIds().isEmpty()) {
            List<Tag> existingTags = tagService.getTagsByIds(dto.getTagIds())
                    .stream()
                    .map(tagMapper::toTagEntity)
                    .collect(Collectors.toList());
            feedback.setTags(new HashSet<>(existingTags));
        } else {
            feedback.setTags(new HashSet<>());
        }

        Feedback savedFeedback = feedbackRepository.save(feedback);
        PendingJob pendingJob = PendingJob.builder()
                .jobType(JobType.EMBED_FEEDBACK)
                .status(JobStatus.PENDING)
                .referenceId(savedFeedback.getId())
                .build();
        pendingJobRepository.save(pendingJob);
        eventPublisher.publishEvent(new JobEnqueuedEvent());
        return feedbackMapper.toFeedbackResponseDto(savedFeedback);
    }

    @Transactional(readOnly = true)
    public Feedback getFeedbackById(UUID feedbackId) {
        return feedbackRepository.findById(feedbackId).orElseThrow(() -> new EntityNotFoundException("Feedback not found"));
    }

}
