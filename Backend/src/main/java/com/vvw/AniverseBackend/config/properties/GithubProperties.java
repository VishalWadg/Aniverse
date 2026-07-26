package com.vvw.AniverseBackend.config.properties;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@ConfigurationProperties(prefix = "github")
public record GithubProperties (
        String token,
        String repo,
        String webhookSecret
) {}
