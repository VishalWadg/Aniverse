package com.vvw.AniverseBackend.service;

import com.vvw.AniverseBackend.dto.FeedbackRequestDto;
import com.vvw.AniverseBackend.dto.FeedbackResponseDto;
import com.vvw.AniverseBackend.entity.Feedback;
import com.vvw.AniverseBackend.entity.FeedbackGroup;
import com.vvw.AniverseBackend.entity.Tag;
import com.vvw.AniverseBackend.entity.type.FeedbackGroupStatus;
import com.vvw.AniverseBackend.mapper.FeedbackMapper;
import com.vvw.AniverseBackend.repository.FeedbackGroupRepository;
import com.vvw.AniverseBackend.repository.FeedbackRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.vvw.AniverseBackend.mapper.TagMapper;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final TagService tagService;
    private final FeedbackMapper feedbackMapper;
    private final TagMapper tagMapper;
    private final AiEmbeddingService aiEmbeddingService;
    private final FeedbackGroupRepository feedbackGroupRepository;

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

        String content = dto.getContent();
        // Generate embedding for the feedback content
        float[] embedding = aiEmbeddingService.generateEmbedding(content);
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
        Feedback savedFeedback = feedbackRepository.save(feedback);
        return feedbackMapper.toFeedbackResponseDto(savedFeedback);
    }

}
