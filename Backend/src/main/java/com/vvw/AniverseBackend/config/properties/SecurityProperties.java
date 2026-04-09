package com.vvw.AniverseBackend.config.properties;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "application.security.jwt")
public record SecurityProperties(
                Long expiration,
                RefreshToken refreshToken) {
        public record RefreshToken(
                        Long expiration,
                        Long absoluteExpiration) {
        }
}
