package com.vvw.AniverseBackend.service;

import com.vvw.AniverseBackend.client.GithubClient;
import com.vvw.AniverseBackend.dto.internal.GithubLabelDto;
import com.vvw.AniverseBackend.entity.Tag;
import com.vvw.AniverseBackend.repository.TagRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class GithubSyncService {
    private final GithubClient githubClient;
    private final TagRepository tagRepository;
    private final TagCommandService tagCommandService;

    /**
     * Entry point triggered automatically when Spring Boot finishes booting.
     */
    @EventListener(ApplicationReadyEvent.class)
    public void syncLabelsOnStartup() {
        log.info("🔄 Initiating GitHub Labels Startup Sync...");

        try {
            // 1. HTTP Call (Outside DB Transaction)
            List<GithubLabelDto> githubLabels = githubClient.getLabels();

            if (githubLabels == null || githubLabels.isEmpty()) {
                log.warn("⚠️ No labels returned from GitHub API.");
                return;
            }

            // 2. Full State Synchronization (Upsert + Stale Cleanup)
            synchronizeLabels(githubLabels);

            log.info("✅ GitHub Labels Sync Complete. Processed {} labels.", githubLabels.size());

        } catch (Exception e) {
            log.error("❌ Failed to sync GitHub labels on startup: {}", e.getMessage(), e);
        }
    }

    /**
     * In-Memory Diff & Batch Builder
     */
    private void synchronizeLabels(List<GithubLabelDto> remoteLabels) {
    // 1. Fetch existing DB tags
    List<Tag> existingTags = tagRepository.findAll();

    // Index existing tags by GitHub ID and Name for O(1) fast lookup
    Map<Long, Tag> dbTagsByGithubId = existingTags.stream()
            .filter(t -> t.getGithubLabelId() != null)
            .collect(Collectors.toMap(Tag::getGithubLabelId, Function.identity(), (t1, t2) -> t1));

    Map<String, Tag> dbTagsByName = existingTags.stream()
            .collect(Collectors.toMap(Tag::getName, Function.identity(), (t1, t2) -> t1));

    List<Tag> tagsToSave = new ArrayList<>();
    Set<Long> processedRemoteIds = new HashSet<>();

    for (GithubLabelDto remote : remoteLabels) {
        processedRemoteIds.add(remote.id());

        // Match by ID first; fallback to Name
        Tag tag = dbTagsByGithubId.get(remote.id());
        if (tag == null) {
            tag = dbTagsByName.getOrDefault(remote.name(), new Tag());
        }

        // A. CHECK DIFF BEFORE MUTATING FIELDS!
        boolean isNew = (tag.getId() == null);
        boolean nameChanged = !Objects.equals(tag.getName(), remote.name());
        boolean descChanged = !Objects.equals(tag.getDescription(), remote.description());
        boolean needsEmbedding = isNew || nameChanged || descChanged || tag.getEmbedding() == null;

        // B. MUTATE FIELDS AFTER DIFFING
        tag.setGithubLabelId(remote.id());
        tag.setName(remote.name());
        tag.setDescription(remote.description());

        // C. CRITICAL STEP: Clear old embedding so saveAllTags knows to re-embed it!
        if (needsEmbedding) {
            tag.setEmbedding(null);
        }

        tagsToSave.add(tag);
    }

    // Identify stale tags deleted from GitHub
    Set<Long> staleGithubIds = dbTagsByGithubId.keySet().stream()
            .filter(id -> !processedRemoteIds.contains(id))
            .collect(Collectors.toSet());

    // Delegate DB operations
    tagCommandService.saveAllTags(tagsToSave);
    tagCommandService.deleteTagsByGithubIds(staleGithubIds);
}
}
