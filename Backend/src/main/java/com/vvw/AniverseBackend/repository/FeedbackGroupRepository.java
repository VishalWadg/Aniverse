package com.vvw.AniverseBackend.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.vvw.AniverseBackend.entity.FeedbackGroup;
import com.vvw.AniverseBackend.entity.type.FeedbackGroupStatus;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface FeedbackGroupRepository extends JpaRepository<FeedbackGroup, UUID> {

        @Query("SELECT g FROM FeedbackGroup g " +
        "WHERE g.status = :status " +
        "AND cosine_distance(g.representativeEmbedding, :queryEmbedding) <= :maxDistance " +
        "ORDER BY cosine_distance(g.representativeEmbedding, :queryEmbedding) ASC LIMIT 1")
Optional<FeedbackGroup> findNearestMatchingGroup(
        @Param("queryEmbedding") float[] queryEmbedding,
        @Param("maxDistance") double maxDistance,
        @Param("status") FeedbackGroupStatus status);

        @Query("SELECT g FROM FeedbackGroup g LEFT JOIN g.feedbacks f " +
                        "WHERE g.status = :status " +
                        "GROUP BY g.id " +
                        "ORDER BY COUNT(f) DESC, g.createdAt DESC")
        Page<FeedbackGroup> findGroupsByStatusWithImpactCount(
                        @Param("status") FeedbackGroupStatus status,
                        Pageable pageable);

        Optional<FeedbackGroup> findByGithubIssueNumber(Integer githubIssueNumber);
}
