package com.vvw.AniverseBackend.service.impl;

import com.vvw.AniverseBackend.dto.internal.TokenRotationResponse;
import com.vvw.AniverseBackend.entity.RefreshToken;
import com.vvw.AniverseBackend.entity.User;
import com.vvw.AniverseBackend.exceptions.EntityNotFoundException;
import com.vvw.AniverseBackend.exceptions.TokenException;
import com.vvw.AniverseBackend.repository.RefreshTokenRepository;
import com.vvw.AniverseBackend.repository.UserRepository;
import com.vvw.AniverseBackend.service.RefreshTokenService;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import com.vvw.AniverseBackend.config.properties.SecurityProperties;
import org.springframework.stereotype.Service;
import org.apache.commons.codec.digest.DigestUtils;


import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.UUID;


@Service
@RequiredArgsConstructor
public class RefreshTokenServiceImpl implements RefreshTokenService {

    private String hashToken(String token) {
        return  DigestUtils.sha256Hex(token.getBytes(StandardCharsets.UTF_8)); // Use Apache Commons Codec or similar
    }

    private final SecurityProperties securityProperties;
    private final RefreshTokenRepository refreshTokenRepository;
    private final UserRepository userRepository;

    @Override
    public RefreshToken findByToken(String token) {
        String hashedToken = hashToken(token);
        return refreshTokenRepository.findByToken(hashedToken)
                .orElseThrow(() -> new TokenException("Invalid refresh token."));
    }

    @Transactional
    @Override
    public String createRefreshToken(Long userId){
        Instant newAbsoluteExpiry = Instant.now().plusMillis(securityProperties.refreshToken().absoluteExpirationMs());
        TokenRotationResponse response = createRefreshTokenInternal(userId, newAbsoluteExpiry);
        return response.rawToken();
    }

//    @Transactional
    public TokenRotationResponse createRefreshTokenInternal(Long userId, Instant absoluteExpiry) {
        User user = userRepository.findById(userId).orElseThrow(() -> new EntityNotFoundException("User not found"));
        refreshTokenRepository.deleteByUser(user);
        String rawToken = UUID.randomUUID().toString();
        RefreshToken refreshToken = RefreshToken.builder()
                        .token(hashToken(rawToken))
                        .expiryDate(Instant.now().plusMillis(securityProperties.refreshToken().expirationMs()))
                        .absoluteExpiry(absoluteExpiry)
                        .user(user)
                        .build();
        refreshTokenRepository.save(refreshToken);
        return new TokenRotationResponse(rawToken, user);
    }

    @Override
    public RefreshToken verifyExpiration(RefreshToken token) {
        if (token.getExpiryDate().isBefore(Instant.now())) {
            refreshTokenRepository.delete(token);
            throw new TokenException("Session ended. Please make a new login request");
        }
        return token;
    }

    @Transactional
    @Override
    public int deleteByUserId(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new EntityNotFoundException("Deletion Failed: User not found with id: "+userId));
        return refreshTokenRepository.deleteByUser(user);
    }

    @Override
    public Long getRefreshTokenDurationSeconds() {
        return securityProperties.refreshToken().expirationMs()/1000;
    }

    @Override
    @Transactional
    public TokenRotationResponse rotateRefreshToken(String token){
        RefreshToken oldToken = findByToken(token);
        verifyExpiration(oldToken);

        if(oldToken.getAbsoluteExpiry().isBefore(Instant.now())){
            refreshTokenRepository.delete(oldToken);
            throw new TokenException("Session limit reached. Please login again..");
        }

        return createRefreshTokenInternal(
                oldToken.getUser().getId(),
                oldToken.getAbsoluteExpiry()
        );
    }

    @Transactional
    @Override
    public void deleteByToken(String newRawToken) {
        String hashedToken = hashToken(newRawToken);
        refreshTokenRepository.findByToken(hashedToken)
                .ifPresent(refreshTokenRepository::delete);
    }
}
