package com.vvw.AniverseBackend.service;

import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.vvw.AniverseBackend.dto.TagDto;
import com.vvw.AniverseBackend.mapper.TagMapper;
import com.vvw.AniverseBackend.repository.TagRepository;

@Service
@RequiredArgsConstructor
public class TagService {
    private final TagRepository tagRepository;
    private final TagMapper tagMapper;
    private final AiEmbeddingService aiEmbeddingService;

    @Transactional(readOnly = true)
    public List<TagDto> getAllAvailableTags() {
        return tagRepository.findAll().stream()
                .map(tagMapper::toTagDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TagDto> getSuggestedTags(String userText){
        if (userText == null || userText.isBlank() || userText.trim().length() < 3) {
            return List.of();
        }
        float [] embedding = aiEmbeddingService.generateEmbedding(userText.trim());
        return tagRepository.getTagsByEmbedding(embedding)
                .stream()
                .map(tagMapper::toTagDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TagDto> getTagsByIds(List<UUID> tagIds) {
        return tagRepository.findByIdIn(tagIds).stream()
                .map(tagMapper::toTagDto)
                .collect(Collectors.toList());
    }
}
