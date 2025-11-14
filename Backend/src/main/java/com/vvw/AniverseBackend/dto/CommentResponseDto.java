package com.vvw.AniverseBackend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@ToString
@Data
public class CommentResponseDto {
    private Long id;
    private String content;
    private LocalDateTime createdAt;
    private UserResponseDto author;
}
