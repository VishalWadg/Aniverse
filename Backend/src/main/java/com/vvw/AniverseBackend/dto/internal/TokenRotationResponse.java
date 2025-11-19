package com.vvw.AniverseBackend.dto.internal;

import com.vvw.AniverseBackend.entity.User;

public record TokenRotationResponse(String rawToken, User user) {
}
