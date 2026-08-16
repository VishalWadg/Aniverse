package com.vvw.AniverseBackend.service;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import com.cloudinary.utils.ObjectUtils;

import org.springframework.stereotype.Service;

import com.cloudinary.Cloudinary;
import com.vvw.AniverseBackend.config.properties.CloudinaryProperties;
import com.vvw.AniverseBackend.dto.CloudinarySignatureResponse;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class CloudinaryService {
    private final Cloudinary cloudinary;
    private final CloudinaryProperties cloudinaryProperties;

    public CloudinarySignatureResponse generateUploadSignature() {
        long timestamp = Instant.now().getEpochSecond();
        String folder = cloudinaryProperties.folderName();

        Map<String, Object> paramsToSign = new HashMap<>();
        paramsToSign.put("timestamp", timestamp);
        paramsToSign.put("folder", folder);

        String signature = cloudinary.apiSignRequest(paramsToSign, cloudinary.config.apiSecret);

        return new CloudinarySignatureResponse(
                timestamp,
                signature,
                folder,
                cloudinaryProperties.apiKey(),
                cloudinaryProperties.cloudName()
        );
    }

    public void deleteFile(String publicId) {
        try {
            log.info("Attempting to delete Cloudinary file with publicId: {}", publicId);
            cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
            log.info("Successfully deleted file: {}", publicId);
        } catch (Exception e) {
            log.error("Failed to delete file from Cloudinary. PublicId: {}", publicId, e);
            // Throw a custom unchecked exception so your GlobalExceptionHandler can return a 500 or 400
            throw new RuntimeException("Could not delete file from storage provider"); 
        }
    }
}
