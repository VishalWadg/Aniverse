package com.vvw.AniverseBackend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LoginResponseDto {
    private String token;
    private String tokenType = "Bearer";
    private long expiresIn;
    private UserResponseDto user;
}
