package com.vvw.AniverseBackend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TagSuggestionRequest {
    @NotBlank(message = "Content cannot be blank")
    private String query;
}
