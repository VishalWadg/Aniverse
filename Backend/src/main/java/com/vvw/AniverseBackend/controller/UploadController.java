package com.vvw.AniverseBackend.controller;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.cloudinary.Cloudinary;
import com.vvw.AniverseBackend.config.properties.CloudinaryProperties;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/uploads")
@RequiredArgsConstructor
public class UploadController {
    private final Cloudinary cloudinary;
    private final CloudinaryProperties cloudinaryProperties;

    @GetMapping("/signature")
    public ResponseEntity<Map<String, Object>> getUploadSignature() {
        long timestamp = Instant.now().getEpochSecond();

        Map<String, Object> paramsToSign = new HashMap<>();
        paramsToSign.put("timestamp", timestamp);
        paramsToSign.put("folder", cloudinaryProperties.folderName());

        String signature = cloudinary.apiSignRequest(paramsToSign, cloudinary.config.apiSecret);

        Map<String, Object> response = new HashMap<>();
        response.put("timestamp", timestamp);
        response.put("signature", signature);
        response.put("folder", cloudinaryProperties.folderName());

        return ResponseEntity.ok(response);
    }
}
