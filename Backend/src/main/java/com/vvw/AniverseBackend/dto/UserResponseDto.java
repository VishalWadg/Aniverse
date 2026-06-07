package com.vvw.AniverseBackend.dto;

import java.util.UUID;

import com.vvw.AniverseBackend.entity.type.Role;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserResponseDto {
    private UUID id;
    private String username;
    private String name;
    private String email;
    private String profilePic;
    private String bio;
    private Role role;
}
