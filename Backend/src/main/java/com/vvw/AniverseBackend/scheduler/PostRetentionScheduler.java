package com.vvw.AniverseBackend.scheduler;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.vvw.AniverseBackend.service.PostService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class PostRetentionScheduler {
    private final PostService postService;

    @Scheduled(
        cron = "${application.posts.retention.purge-cron}",
        zone = "${application.posts.retention.purge-zone}"
    )

    public void purgeExpiredDeletedPosts(){
        int deleteCount = postService.purgeExpiredDeletedPosts();
        log.info("Post retention job finished. Purged {} expired posts.", deleteCount);
    }
}
