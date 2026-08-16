package com.vvw.AniverseBackend.dto;

public record CloudinarySignatureResponse(
    long timestamp,
    String signature,
    String folder,
    String apiKey,
    String cloudName
) {}