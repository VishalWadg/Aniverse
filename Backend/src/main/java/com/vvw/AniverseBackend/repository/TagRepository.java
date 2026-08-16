package com.vvw.AniverseBackend.repository;

import com.vvw.AniverseBackend.entity.Tag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.NativeQuery;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Repository
public interface TagRepository extends JpaRepository<Tag, UUID> {
    
    // Find multiple tags by their IDs (used when linking pre-populated tags)
    List<Tag> findByIdIn(List<UUID> ids);

    Optional<Tag> findByName(String name);

    Optional<Tag> findByGithubLabelId(Long githubLabelId);

    void deleteAllByGithubLabelIdIn(Set<Long> githubLabelIdsToDelete);

    @Query("SELECT t FROM Tag t ORDER BY cosine_distance(t.embedding, :queryEmbedding) LIMIT 5")
    List<Tag> getTagsByEmbedding(@Param("queryEmbedding")   float [] embedding);
}
