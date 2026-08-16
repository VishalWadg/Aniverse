package com.vvw.AniverseBackend.service.impl;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.jsoup.Jsoup;
import org.springframework.stereotype.Service;

import com.cloudinary.Cloudinary;
import com.cloudinary.api.ApiResponse;
import com.cloudinary.utils.ObjectUtils;
import com.vvw.AniverseBackend.config.properties.CloudinaryProperties;
import com.vvw.AniverseBackend.config.properties.ImageCleanupProperties;
import com.vvw.AniverseBackend.repository.PostRepository;
import com.vvw.AniverseBackend.service.ImageCleanupService;
import com.vvw.AniverseBackend.util.PostImageExtractor;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class ImageCleanupServiceImpl implements ImageCleanupService {
    private final PostRepository postRepository;
    private final CloudinaryProperties cloudinaryProperties;
    private final ImageCleanupProperties imageCleanupProperties;
    private final Cloudinary cloudinary;
    // Class-level Constants
    private static final int CLOUDINARY_MAX_PAGE_RESULTS = 500;
    private static final int CLOUDINARY_MAX_DELETE_BATCH_SIZE = 100;

    private Set<String> getEligibleCloudinaryPublicIds() throws Exception {
        Map<String, Object> options = new HashMap<>();
        options.put("type", "upload");
        options.put("prefix", cloudinaryProperties.folderName());
        options.put("max_results", CLOUDINARY_MAX_PAGE_RESULTS);

        Set<String> eligiblePublicIds = new HashSet<>();
        String nextCursor = null;

        // Cutoff: Don't delete images uploaded within the configured grace period hours
        Instant cutoffTime = Instant.now().minus(imageCleanupProperties.gracePeriodHours(), ChronoUnit.HOURS);

        do {
            if (nextCursor != null) {
                options.put("next_cursor", nextCursor);
            }

            ApiResponse response = cloudinary.api().resources(options);
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> resources = (List<Map<String, Object>>) response.get("resources");

            if (resources != null) {
                for (Map<String, Object> resource : resources) {
                    String publicId = (String) resource.get("public_id");
                    String createdAtStr = (String) resource.get("created_at");

                    if (publicId != null && createdAtStr != null) {
                        Instant createdAt = Instant.parse(createdAtStr);
                        // Only include if the image is older than the cutoff time
                        if (createdAt.isBefore(cutoffTime)) {
                            eligiblePublicIds.add(publicId);
                        }
                    }
                }
            }
            nextCursor = (String) response.get("next_cursor");

        } while (nextCursor != null && !nextCursor.isEmpty());

        return eligiblePublicIds;
    }

    @Override
    public int cleanupOrphanedCloudinaryImages() {
        Set<String> referencedPublicIds;
        try {
            List<String> contents = postRepository.findAllPostContents();
referencedPublicIds = contents.stream()
        .flatMap(content -> PostImageExtractor.extractPublicIds(content).stream())
        .collect(Collectors.toSet());
        } catch (Exception e) {
            log.error("Phase 1 Failed: Failed to scan database post HTML for image references", e);
            throw new RuntimeException("Image cleanup job aborted at Phase 1 (DB scan)", e);
        }
        // 2. Phase 2 & 5: Collect actual Cloudinary public IDs older than grace period
        Set<String> eligiblePublicIds;
        try {
            eligiblePublicIds = getEligibleCloudinaryPublicIds();
        } catch (Exception e) {
            log.error("Phase 2 Failed: Failed to enumerate Cloudinary Admin API assets", e);
            throw new RuntimeException("Image cleanup job aborted at Phase 2 (Cloudinary API scan)", e);
        }

        // 3. Phase 3: Diff orphaned set
        Set<String> orphanedPublicIds = new HashSet<>(eligiblePublicIds);
        orphanedPublicIds.removeAll(referencedPublicIds);

        if (orphanedPublicIds.isEmpty()) {
            log.info("Cloudinary image cleanup completed. No orphaned images found.");
            return 0;
        }

        // Phase 5: Dry-Run Mode
        if (imageCleanupProperties.dryRun()) {
            log.info(
                    "[DRY-RUN] Cloudinary image cleanup finished. Found {} orphaned image assets. 0 images deleted (dry-run mode active). Orphaned IDs: {}",
                    orphanedPublicIds.size(), orphanedPublicIds);
            return 0;
        }

        // Phase 3: Batch deletion (max 100 per API call)
        List<String> orphanedList = new ArrayList<>(orphanedPublicIds);
        int deletedTotal = 0;

        for (int i = 0; i < orphanedList.size(); i += CLOUDINARY_MAX_DELETE_BATCH_SIZE) {
            List<String> batch = orphanedList.subList(i,
                    Math.min(i + CLOUDINARY_MAX_DELETE_BATCH_SIZE, orphanedList.size()));
            try {
                cloudinary.api().deleteResources(batch, ObjectUtils.emptyMap());
                deletedTotal += batch.size();
            } catch (Exception e) {
                log.error("Phase 3 Error: Failed to delete Cloudinary batch of {} images: {}", batch.size(), batch, e);
            }
        }

        log.info("Successfully purged {} orphaned Cloudinary image assets.", deletedTotal);
        return deletedTotal;

    }
}
