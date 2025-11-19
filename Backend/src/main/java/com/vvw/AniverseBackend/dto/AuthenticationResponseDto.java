package com.vvw.AniverseBackend.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AuthenticationResponseDto {
    private String token;

    @Builder.Default        // Tells Builder to use "Bearer" if no value is provided
    private String tokenType = "Bearer";
    private long expiresIn;
    @JsonIgnore
    private String refToken;
    private UserResponseDto user;
}
