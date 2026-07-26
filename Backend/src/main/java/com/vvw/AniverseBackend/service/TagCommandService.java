package com.vvw.AniverseBackend.service;

import com.vvw.AniverseBackend.entity.Tag;
import com.vvw.AniverseBackend.repository.TagRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class TagCommandService {
    private TagRepository tagRepository;

    // Automatically save

    @Transactional
    public List<Tag> sasveAllTags(List<Tag> tags){
        return tagRepository.saveAll(tags);
    }

    /**
     * Atomically deletes tags removed from GitHub.
     */
    @Transactional
    public void deleteTagsByGithubIds(Set<Long> githubLabelIdsToDelete) {
        if (githubLabelIdsToDelete.isEmpty()) return;

        log.info("🗑️ Cleaning up {} stale tags removed from GitHub...", githubLabelIdsToDelete.size());
        tagRepository.deleteAllByGithubLabelIdIn(githubLabelIdsToDelete);
    }

    public void saveAllTags(List<Tag> tagsToSave) {
    }
}
