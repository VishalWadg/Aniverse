package com.vvw.AniverseBackend.dto;

import java.util.List;

import jakarta.validation.constraints.NotBlank;

public record ApproveGroupRequestDto (
    @NotBlank String title, 
    @NotBlank String body,
    List<String> labels
){}
