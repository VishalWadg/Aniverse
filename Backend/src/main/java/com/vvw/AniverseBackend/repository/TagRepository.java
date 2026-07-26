package com.vvw.AniverseBackend.repository;

import com.vvw.AniverseBackend.entity.Tag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Repository
public interface TagRepository extends JpaRepository<Tag, UUID> {
    
    // Find multiple tags by their names (used when linking pre-populated tags)
    List<Tag> findByNameIn(List<String> names);

    Optional<Tag> findByGithubLabelId(Long githubLabelId);

    void deleteAllByGithubLabelIdIn(Set<Long> githubLabelIdsToDelete);
}
