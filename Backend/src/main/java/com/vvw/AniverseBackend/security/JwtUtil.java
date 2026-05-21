package com.vvw.AniverseBackend.security;

import com.vvw.AniverseBackend.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.WeakKeyException;
import com.vvw.AniverseBackend.config.properties.JwtProperties;
import com.vvw.AniverseBackend.config.properties.SecurityProperties;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.concurrent.TimeUnit;

@Component
public class JwtUtil {

    private final SecurityProperties securityProperties;
    private final JwtProperties jwtProperties;

    public JwtUtil(SecurityProperties securityProperties, JwtProperties jwtProperties) {
        this.securityProperties = securityProperties;
        this.jwtProperties = jwtProperties;
    }

    private SecretKey getSecretKey(){
        String secretKey = jwtProperties.secretKey();

        if (secretKey == null || secretKey.isBlank()) {
            throw new IllegalStateException("JWT_SECRET is missing. Set a value with at least 32 UTF-8 bytes for HS256.");
        }

        try {
            return Keys.hmacShaKeyFor(secretKey.getBytes(StandardCharsets.UTF_8));
        } catch (WeakKeyException ex) {
            throw new IllegalStateException(
                    "JWT_SECRET is too short for JWT HMAC signing. Use at least 32 UTF-8 bytes for HS256.",
                    ex
            );
        }
    }
    public String generateAccessToken(User user) {
        return Jwts.builder()
                .subject(user.getUsername())
                .claim("userId",user.getId().toString())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + securityProperties.expirationMs()))
                .signWith(getSecretKey())
                .compact();
    }

    public long getExpirationInSeconds() {
        return TimeUnit.MILLISECONDS.toSeconds(securityProperties.expirationMs());
        // This will return 600 (for 10 minutes)
    }

    public String getUsernameFromToken(String token){
        Claims claims = Jwts.parser()
                .verifyWith(getSecretKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
        return  claims.getSubject();
    }

}
