package com.vvw.AniverseBackend.service;

public interface ImageCleanupService {
    /**
     * Cleans up expired images from the database and Cloudinary.
     */
    int cleanupOrphanedCloudinaryImages();
}
