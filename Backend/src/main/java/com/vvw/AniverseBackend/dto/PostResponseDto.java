package com.vvw.AniverseBackend.dto;

import com.vvw.AniverseBackend.entity.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PostResponseDto {
    private UUID id;
    private String title;
    private String content;
    private LocalDateTime createdAt;
    private Boolean isDeleted;
    private UserResponseDto author;
}
