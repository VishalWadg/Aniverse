package com.vvw.AniverseBackend.service;

import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.vvw.AniverseBackend.entity.FeedbackGroup;
import com.vvw.AniverseBackend.entity.type.FeedbackGroupStatus;
import com.vvw.AniverseBackend.repository.FeedbackGroupRepository;
import com.vvw.AniverseBackend.repository.FeedbackRepository;
import java.util.Optional;
import com.vvw.AniverseBackend.entity.Feedback;
import jakarta.persistence.EntityNotFoundException;

import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class FeedbackGroupingService {
    private final FeedbackGroupRepository feedbackGroupRepository;
    private final FeedbackRepository feedbackRepository;
    private final EntityManager entityManager;

    @Transactional
    public void assignFeedbackToGroup(UUID feedbackId, float[] embedding) {
        entityManager.createNativeQuery("SELECT pg_advisory_xact_lock(:key)")
                .setParameter("key", 424242L)
                .getSingleResult();
        Feedback feedback = feedbackRepository
                .findById(feedbackId)
                .orElseThrow(() -> new EntityNotFoundException("Feedback not found: " + feedbackId));
        String content = feedback.getContent();
        feedback.setEmbedding(embedding);
        Optional<FeedbackGroup> matchOpt = feedbackGroupRepository.findNearestMatchingGroup(
                embedding,
                0.15,
                FeedbackGroupStatus.PENDING);
        if (matchOpt.isPresent()) {
            feedback.setGroup(matchOpt.get());
        } else {
            FeedbackGroup newGroup = FeedbackGroup.builder()
                    .title(content.substring(0, Math.min(content.length(), 255)))
                    .representativeEmbedding(embedding)
                    .status(com.vvw.AniverseBackend.entity.type.FeedbackGroupStatus.PENDING)
                    .build();
            feedback.setGroup(feedbackGroupRepository.save(newGroup));
        }
        feedbackRepository.save(feedback);
    }
}
