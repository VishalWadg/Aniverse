package com.vvw.AniverseBackend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateUserProfileDto {
    @Size(min = 3, max = 50, message = "Name should be 3-50 characters long")
    private String name;

    @Email(message = "Email must be valid")
    @Size(min = 5, max = 100, message = "Email should be 5-100 characters long")
    private String email;

    @Size(max = 280, message = "Bio should be 280 characters or fewer")
    private String bio;

    @Size(max = 2048, message = "Profile picture URL should be 2048 characters or fewer")
    private String profilePic;
}
