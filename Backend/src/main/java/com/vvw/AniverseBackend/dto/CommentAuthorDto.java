package com.vvw.AniverseBackend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@AllArgsConstructor
@NoArgsConstructor
@ToString
@Data
public class CommentAuthorDto {
    private Long id;
    private String username;
    private String profilepic;
}
