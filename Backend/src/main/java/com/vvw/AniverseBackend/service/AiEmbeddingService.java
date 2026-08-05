package com.vvw.AniverseBackend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AiEmbeddingService {

    private final EmbeddingModel embeddingModel;

    /**
     * Generates a 768-dimension vector embedding for a single text.
     */
    public float[] generateEmbedding(String text) {
        if (text == null || text.isBlank()) {
            throw new IllegalArgumentException("Cannot generate an embedding for null or blank text");
        }
        return embeddingModel.embed(text.trim());
    }

    /**
     * Generates vector embeddings for a batch of texts in a single API call.
     */
    public List<float[]> generateEmbeddings(List<String> texts) {
        // 1. Check for empty/null list
        if (texts == null || texts.isEmpty()) {
            return List.of();
        }

        // 2. Validate that no individual element inside the list is null or blank
        boolean hasBlankElements = texts.stream().anyMatch(t -> t == null || t.isBlank());
        if (hasBlankElements) {
            throw new IllegalArgumentException("Cannot generate embeddings: Batch list contains null or blank elements");
        }

        // 3. Trim all strings and execute batch API call
        List<String> sanitizedTexts = texts.stream()
                .map(String::trim)
                .toList();

        return embeddingModel.embed(sanitizedTexts);
    }
}