package com.vvw.AniverseBackend.dto;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CreateCommentDto {
    @Size(max = 5000, message = "Comment is too long.")
    @NotBlank(message = "Comment can not be empty.")
    @NotNull
    private String content;
}
