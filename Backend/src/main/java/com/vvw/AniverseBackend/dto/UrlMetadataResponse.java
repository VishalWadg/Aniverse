package com.vvw.AniverseBackend.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record UrlMetadataResponse(
        int success,
        String link,
        UrlMetadataMeta meta
) {
}
