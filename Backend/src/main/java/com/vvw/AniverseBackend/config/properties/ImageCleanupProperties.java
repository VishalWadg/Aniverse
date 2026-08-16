package com.vvw.AniverseBackend.config.properties;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@ConfigurationProperties(prefix = "application.posts.image-cleanup")
@Validated
public record ImageCleanupProperties(
        @NotBlank String cron,
        @NotBlank String cronZone,
        @Min(0) long gracePeriodHours,
        boolean dryRun
) {}