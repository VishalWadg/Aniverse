package com.vvw.AniverseBackend.security;

import com.vvw.AniverseBackend.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.concurrent.TimeUnit;

@Component
public class JwtUtil {
    private final Long EXPIRATION_TIME_MS = TimeUnit.MINUTES.toMillis(10);
    @Value("${jwt.secretKey}")
    private String secreteKey;

    private SecretKey getSecretKey(){
        return Keys.hmacShaKeyFor(secreteKey.getBytes(StandardCharsets.UTF_8));
    }
    public String generateAccessToken(User user) {
        return Jwts.builder()
                .subject(user.getUsername())
                .claim("userId",user.getId().toString())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME_MS))
                .signWith(getSecretKey())
                .compact();
    }

    public long getExpirationInSeconds() {
        return TimeUnit.MILLISECONDS.toSeconds(EXPIRATION_TIME_MS);
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
