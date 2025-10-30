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
public class UpdatePostDto {
    @NotBlank
    @Size(min=5, max=25, message = "Title should be of lenght 5-25")
    private String title;
    @NotNull
    @Size(min=10, message = "Post should be Greater than 10 characters")
    private String content;
}
