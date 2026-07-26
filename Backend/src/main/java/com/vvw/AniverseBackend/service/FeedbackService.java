package com.vvw.AniverseBackend.service;

import com.vvw.AniverseBackend.dto.FeedbackRequestDto;
import com.vvw.AniverseBackend.dto.FeedbackResponseDto;
import com.vvw.AniverseBackend.dto.TagDto;
import com.vvw.AniverseBackend.entity.Feedback;
import com.vvw.AniverseBackend.entity.Tag;
import com.vvw.AniverseBackend.mapper.FeedbackMapper;
import com.vvw.AniverseBackend.repository.FeedbackRepository;
import com.vvw.AniverseBackend.repository.TagRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final TagRepository tagRepository;
    private final FeedbackMapper feedbackMapper;

    @Transactional
    public FeedbackResponseDto createFeedback(FeedbackRequestDto dto) {
        Feedback feedback = new Feedback();
        feedback.setContent(dto.getContent());
        feedback.setAttachments(dto.getAttachments());

        // Process Tags: Only allow pre-populated tags based on exact name match
        if (dto.getTags() != null && !dto.getTags().isEmpty()) {
            List<Tag> existingTags = tagRepository.findByNameIn(dto.getTags());
            feedback.setTags(new HashSet<>(existingTags));
        } else {
            feedback.setTags(new HashSet<>());
        }

        Feedback savedFeedback = feedbackRepository.save(feedback);
        return feedbackMapper.toFeedbackResponseDto(savedFeedback);
    }

    @Transactional(readOnly = true)
    public List<TagDto> getAllAvailableTags() {
        return tagRepository.findAll().stream()
                .map(feedbackMapper::toTagDto)
                .collect(Collectors.toList());
    }
}
