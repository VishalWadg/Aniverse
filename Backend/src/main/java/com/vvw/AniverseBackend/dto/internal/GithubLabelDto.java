package com.vvw.AniverseBackend.dto.internal;

public record GithubLabelDto(
        Long id,
        String name,
        String description,
        String color
) {
}
