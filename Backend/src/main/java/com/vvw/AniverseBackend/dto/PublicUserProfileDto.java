package com.vvw.AniverseBackend.dto;

import com.vvw.AniverseBackend.entity.type.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PublicUserProfileDto {
    private UUID id;
    private String username;
    private String name;
    private String bio;
    private String profilePic;
    private Role role;
    private LocalDateTime createdAt;
    private long postCount;
}
