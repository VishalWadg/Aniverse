package com.vvw.AniverseBackend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class FeedbackRequestDto {

    @NotBlank(message = "Feedback content cannot be empty")
    @Size(max = 5000, message = "Feedback content must not exceed 5000 characters")
    private String content;

    private List<String> attachments;

    private List<String> tags; // Expecting tag names to map to existing labels

}
