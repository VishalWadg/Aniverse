package com.vvw.AniverseBackend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequestDto {
    @NotBlank(message = "Username is required")
    @Size(min=3, max=30, message="Username should be 3-30 characters long")
    private String username;

    @NotBlank(message = "Password is required")
    @Size(min=8, message="Password must be at least 8 characters")
    private String password;
}
