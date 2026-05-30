package com.vvw.AniverseBackend.service;

import com.vvw.AniverseBackend.dto.internal.TokenRotationResponse;
import com.vvw.AniverseBackend.entity.RefreshToken;

import java.util.UUID;


public interface RefreshTokenService {

    RefreshToken findByToken(String token);

    String createRefreshToken(UUID userId);

    RefreshToken verifyExpiration(RefreshToken token);

    int deleteByUserId(UUID userId);

    void deleteByToken(String token);

    Long getRefreshTokenDurationSeconds();

    TokenRotationResponse rotateRefreshToken(String oldRawToken);

}
