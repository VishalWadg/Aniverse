package com.vvw.AniverseBackend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateUserDto {
    @NotBlank(message = "Name is required")
    @Size(min=3, max=30, message="Name should be 3-30 characters long")
    private String name;

    @NotBlank(message = "Username is required")
    @Size(min=3, max=30, message="Username should be 3-30 characters long")
    private String username;

    @NotBlank(message = "Email is Required")
    @Email
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min=2, message="Password must be at least 8 characters")
    private String password;
}
