package com.vvw.AniverseBackend.dto.internal;

import java.util.List;

public record GithubCreateIssueRequestDto(
    String title,
    String body,
    List<String> labels
) {}
