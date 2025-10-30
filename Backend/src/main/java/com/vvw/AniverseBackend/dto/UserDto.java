package com.vvw.AniverseBackend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserDto {
    private Long id;
    @NotBlank(message = "Name is required")
    @Size(min=5, max=30, message="Name should be 3-30 characters long")
    private String name;
    @NotBlank(message = "Eamil is Required")
    @Email
    private String email;
}
