package com.vvw.AniverseBackend.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import com.vvw.AniverseBackend.entity.type.FeedbackGroupStatus;

public record FeedbackGroupResponseDto(
    UUID id,
    String title,
    FeedbackGroupStatus status,
    Integer githubIssueNumber,
    String githubIssueUrl,
    int impactCount,
    List<FeedbackResponseDto> feedbacks,
    Instant createdAt
) {} 