package com.vvw.AniverseBackend.config.properties;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@ConfigurationProperties(prefix = "application.posts.retention")
@Validated
public record PostRetentionProperties(
        @Min(1) long days,
        @NotBlank String purgeCron,
        @NotBlank String purgeZone
) {
}
