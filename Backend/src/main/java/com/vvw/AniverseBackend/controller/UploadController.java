package com.vvw.AniverseBackend.controller;

import com.vvw.AniverseBackend.service.CloudinaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.vvw.AniverseBackend.dto.CloudinarySignatureResponse;

@RestController
@RequestMapping("/uploads")
@RequiredArgsConstructor
public class UploadController {

    private final CloudinaryService cloudinaryService;

    @GetMapping("/signature")
    @PreAuthorize("isAuthenticated()") 
    public ResponseEntity<CloudinarySignatureResponse> getUploadSignature() {
        return ResponseEntity.ok(cloudinaryService.generateUploadSignature());
    }

    @DeleteMapping
    @PreAuthorize("isAuthenticated()") 
    public ResponseEntity<Void> deleteUpload(@RequestParam("publicId") String publicId) {
        cloudinaryService.deleteFile(publicId);
        return ResponseEntity.noContent().build();
    }
}