package com.vvw.AniverseBackend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.time.LocalDateTime;
import java.util.UUID;

@AllArgsConstructor
@NoArgsConstructor
@ToString
@Data
public class CommentResponseDto {
    private UUID id;
    private String content;
    private LocalDateTime createdAt;
    private CommentAuthorDto author;
}
