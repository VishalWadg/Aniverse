package com.vvw.AniverseBackend.service;

import com.vvw.AniverseBackend.entity.Tag;
import com.vvw.AniverseBackend.repository.TagRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.collections4.ListUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class TagCommandService {

    private final TagRepository tagRepository;
    private final AiEmbeddingService aiEmbeddingService;

    private static final int BATCH_SIZE = 50;

    private String buildEmbeddingInput(Tag tag) {
        if (tag == null || tag.getName() == null) {
            return "";
        }
        if (tag.getDescription() == null || tag.getDescription().isBlank()) {
            return "GitHub label category: " + tag.getName().trim();
        }
        return tag.getName().trim() + " " + tag.getDescription().trim();
    }

    private List<float[]> generateEmbeddingsInChunks(List<String> texts) {
        List<List<String>> partitions = ListUtils.partition(texts, BATCH_SIZE);
        List<float[]> allEmbeddings = new ArrayList<>(texts.size());
        for (List<String> batch : partitions) {
            allEmbeddings.addAll(aiEmbeddingService.generateEmbeddings(batch));
        }
        return allEmbeddings;
    }

    private boolean isTextChanged(Tag tag, String newName, String newDescription) {
        if (tag.getId() == null) {
            return true; // New unpersisted entity always needs an embedding
        }
        boolean nameChanged = !Objects.equals(tag.getName(), newName);
        boolean descriptionChanged = !Objects.equals(tag.getDescription(), newDescription);
        return nameChanged || descriptionChanged;
    }

    @Transactional
    public List<Tag> saveAllTags(List<Tag> tags) {
        if (tags == null || tags.isEmpty()) {
            return List.of();
        }

        // 1. Filter tags that need new embeddings (new tags OR edited tags with cleared
        // embeddings)
        List<Tag> tagsNeedingEmbedding = tags.stream()
                .filter(t -> t.getEmbedding() == null)
                .toList();

        // 2. ONLY call Gemini if there are tags that actually need new embeddings!
        if (!tagsNeedingEmbedding.isEmpty()) {
            log.info("Generating embeddings for {} new/updated tags...", tagsNeedingEmbedding.size());

            List<String> textsToEmbed = tagsNeedingEmbedding.stream()
                    .map(this::buildEmbeddingInput)
                    .toList();

            List<float[]> embeddings = generateEmbeddingsInChunks(textsToEmbed);

            if (embeddings == null || embeddings.size() != tagsNeedingEmbedding.size()) {
                throw new IllegalStateException("Mismatched vector size returned from AI service");
            }

            for (int i = 0; i < tagsNeedingEmbedding.size(); i++) {
                tagsNeedingEmbedding.get(i).setEmbedding(embeddings.get(i));
            }
        } else {
            log.info("All {} tags are up to date. Skipping Gemini API calls.", tags.size());
        }

        // 3. Batch Save all tags to PostgreSQL
        return tagRepository.saveAll(tags);
    }

    @Transactional
    public void deleteTagsByGithubIds(Set<Long> githubLabelIdsToDelete) {
        if (githubLabelIdsToDelete == null || githubLabelIdsToDelete.isEmpty()) {
            return;
        }

        log.info("🗑️ Cleaning up {} stale tags removed from GitHub...", githubLabelIdsToDelete.size());
        tagRepository.deleteAllByGithubLabelIdIn(githubLabelIdsToDelete);
    }

    @Transactional
    public void upsertSingleTag(Long githubLabelId, String name, String description) {
        Tag tag = tagRepository.findByGithubLabelId(githubLabelId)
                .orElseGet(() -> tagRepository.findByName(name)
                        .orElseGet(Tag::new));

        // 1. CHECK BEFORE MUTATION: Did the text actually change or is embedding
        // missing?
        boolean needsEmbedding = tag.getEmbedding() == null || isTextChanged(tag, name, description);

        // 2. Update entity fields
        tag.setGithubLabelId(githubLabelId);
        tag.setName(name);
        tag.setDescription(description);

        // 3. ONLY call AI API if text changed or embedding is missing
        if (needsEmbedding) {
            String textToEmbed = buildEmbeddingInput(tag);
            float[] embedding = aiEmbeddingService.generateEmbedding(textToEmbed);
            tag.setEmbedding(embedding);
            log.info("Generated new embedding vector for tag [{}]", name);
        } else {
            log.debug("Skipping embedding generation for tag [{}] (no text changes)", name);
        }

        tagRepository.save(tag);
    }
}