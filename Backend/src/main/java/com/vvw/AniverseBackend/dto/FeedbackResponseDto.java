package com.vvw.AniverseBackend.dto;

import lombok.Data;

import java.time.Instant;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Data
public class FeedbackResponseDto {
    private UUID id;
    private String content;
    private List<String> attachments;
    private Set<TagDto> tags;
    private Instant createdAt;
}
