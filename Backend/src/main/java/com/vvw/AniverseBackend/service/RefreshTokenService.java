package com.vvw.AniverseBackend.service;

import com.vvw.AniverseBackend.dto.internal.TokenRotationResponse;
import com.vvw.AniverseBackend.entity.RefreshToken;



public interface RefreshTokenService {

    RefreshToken findByToken(String token);

    String createRefreshToken(Long userId);

    RefreshToken verifyExpiration(RefreshToken token);

    int deleteByUserId(Long userId);

    void deleteByToken(String token);

    Long getRefreshTokenDurationSeconds();

    TokenRotationResponse rotateRefreshToken(String oldRawToken);

}
