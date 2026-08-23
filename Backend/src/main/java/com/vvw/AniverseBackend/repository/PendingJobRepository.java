package com.vvw.AniverseBackend.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import com.vvw.AniverseBackend.entity.PendingJob;

public interface PendingJobRepository extends JpaRepository<PendingJob, UUID> {
    @Transactional
    @Query(nativeQuery = true, value = "UPDATE pending_jobs " +
            "SET status = 'PROCESSING', updated_at = CURRENT_TIMESTAMP " +
            "WHERE id IN (" +
            "    SELECT id FROM pending_jobs " +
            "    WHERE status = 'PENDING' AND next_attempt_at <= CURRENT_TIMESTAMP " +
            "    AND job_type IN (:jobTypes) " +
            "    ORDER BY created_at ASC " +
            "    LIMIT :batchSize " +
            "    FOR UPDATE SKIP LOCKED" +
            ") " +
            "RETURNING *;")
    List<PendingJob> claimNextPendingJobs(List<String> jobTypes, int batchSize);

    @Modifying
@Transactional
@Query(nativeQuery = true, value = "UPDATE pending_jobs " +
        "SET status = 'PENDING', next_attempt_at = CURRENT_TIMESTAMP " +
        "WHERE status = 'PROCESSING' AND updated_at < CURRENT_TIMESTAMP - INTERVAL '5 minutes'")
int resetStuckProcessingJobs();

}
