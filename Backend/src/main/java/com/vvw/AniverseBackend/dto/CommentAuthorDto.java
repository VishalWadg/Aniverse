package com.vvw.AniverseBackend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CommentAuthorDto {
    private Long id;
    private String username;
    private String profilePic;
}
