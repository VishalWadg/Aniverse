package com.vvw.AniverseBackend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data

public class RegisterUserRequestDto {
    private String name;
    @NotBlank(message = "Eamil is Required")
    @Email
    private String email;
    @NotBlank
    private String password;
}
