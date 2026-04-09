package com.vvw.AniverseBackend.config.properties;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "application.security.jwt")
public record SecurityProperties(
                java.time.Duration expiration,
                RefreshToken refreshToken) {
        public record RefreshToken(
                        java.time.Duration expiration,
                        java.time.Duration absoluteExpiration) {
        }
}
