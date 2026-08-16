package com.vvw.AniverseBackend.security;

import java.nio.charset.StandardCharsets;
import java.util.HexFormat;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.boot.actuate.autoconfigure.observation.ObservationProperties.Http;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import com.vvw.AniverseBackend.config.properties.GithubProperties;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import java.security.MessageDigest;

@Component
@RequiredArgsConstructor
@Slf4j
public class GithubSignatureVerifier {
    private final GithubProperties githubProperties;

    public void verify(String payload, String signatureHeader){
        String secret = githubProperties.webhookSecret();
        if(secret == null || secret.isBlank()){
            log.error("GITHUB_WEBHOOK_SECRETE is not configured in environment/properties!");
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Webhook secrete is not configured on the server");
        }
        if(signatureHeader == null || !signatureHeader.startsWith("sha256=")){
            log.warn("🚨 Webhook request missing or invalid X-Hub-Signature-256 header.");
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing or malformed signature header");
        }
        try{
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secreteKey = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secreteKey);
            byte [] hash = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            String expectedSignature = "sha256=" + HexFormat.of().formatHex(hash);
            boolean isMatch = MessageDigest.isEqual(
                    expectedSignature.getBytes(StandardCharsets.UTF_8),
                    signatureHeader.getBytes(StandardCharsets.UTF_8)
                );
            if(!isMatch){
                log.warn("Webhook Signature Mismatch!");
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid Signature");
            }

        }catch (ResponseStatusException res){
            throw res;
        }catch (Exception e){
            log.error("Cryptographic error during signature verification: {}", e.getMessage(), e);
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "signatur verification failed");
        }
    }
    
}
