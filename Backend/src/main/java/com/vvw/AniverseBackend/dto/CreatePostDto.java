package com.vvw.AniverseBackend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreatePostDto {

    // ID is not here because it hasn't been created yet.

    @NotBlank(message = "Title cannot be empty")
    @Size(min = 3, max = 100)
    private String title;

    @NotBlank(message = "Content cannot be empty")
    private String content;

//    @NotNull
//    private Long categoryId;
}