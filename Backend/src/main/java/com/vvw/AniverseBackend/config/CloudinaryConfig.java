package com.vvw.AniverseBackend.config;

import java.util.HashMap;
import java.util.Map;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.cloudinary.Cloudinary;
import com.vvw.AniverseBackend.config.properties.CloudinaryProperties;

import lombok.RequiredArgsConstructor;

@Configuration
@EnableConfigurationProperties
@RequiredArgsConstructor
public class CloudinaryConfig {
    private final CloudinaryProperties cloudinaryProperties;

    @Bean
    public Cloudinary cloudinary() {
        Map<String, String> config = new HashMap<>();
        config.put("cloud_name", cloudinaryProperties.cloudName());
        config.put("api_key", cloudinaryProperties.apiKey());
        config.put("api_secret", cloudinaryProperties.apiSecret());
        config.put("secure", "true");
        return new Cloudinary(config);

    }
}
