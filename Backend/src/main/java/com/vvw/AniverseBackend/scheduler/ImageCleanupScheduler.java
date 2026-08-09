package com.vvw.AniverseBackend.scheduler;

import com.vvw.AniverseBackend.service.ImageCleanupService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class ImageCleanupScheduler {
    private final ImageCleanupService imageCleanupService;

    @Scheduled(
        cron = "${application.posts.image-cleanup.cron}",
        zone = "${application.posts.image-cleanup.cron-zone}"
    )
    public void runImageCleanupJob() {
        log.info("Starting scheduled Cloudinary image cleanup job...");
        int purgedCount = imageCleanupService.cleanupOrphanedCloudinaryImages();
        log.info("Completed Cloudinary image cleanup job. Purged {} orphaned assets.", purgedCount);
    }
}
