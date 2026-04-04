package com.vvw.AniverseBackend.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record UrlMetadataMeta(
        String title,
        String description,
        UrlMetadataImage image,
        @JsonProperty("site_name") String siteName
) {
}
