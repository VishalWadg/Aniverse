package com.vvw.AniverseBackend.security;

import com.vvw.AniverseBackend.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
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
        return Keys.hmacShaKeyFor(jwtProperties.secretKey().getBytes(StandardCharsets.UTF_8));
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
