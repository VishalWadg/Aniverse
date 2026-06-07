package com.vvw.AniverseBackend.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.vvw.AniverseBackend.dto.CommentResponseDto;
import com.vvw.AniverseBackend.dto.CreateCommentDto;
import com.vvw.AniverseBackend.entity.User;
import com.vvw.AniverseBackend.service.CommentService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import java.util.UUID;


@RestController
@RequiredArgsConstructor
public class CommentController {
    private final CommentService commentService;
    
    @PostMapping("/posts/{postId}/comments")
    public ResponseEntity<CommentResponseDto> createComment(
            @PathVariable UUID postId,
            @Valid @RequestBody CreateCommentDto dto,
            @AuthenticationPrincipal User currentUser) {
            
        CommentResponseDto createdComment = commentService.createComment(dto, currentUser, postId);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdComment);
    }
    
    @PutMapping("/comments/{commentId}")
    public ResponseEntity<CommentResponseDto> updateComment(
        @PathVariable UUID commentId, @Valid @RequestBody CreateCommentDto commentDto, @AuthenticationPrincipal User currentUser
    ) {
        CommentResponseDto responseDto = commentService.updateComment(commentDto, commentId, currentUser);
        return ResponseEntity.ok(responseDto); 
    }

    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(
        @PathVariable UUID commentId, @AuthenticationPrincipal User currentUser
    ) {
        commentService.deleteComment(commentId, currentUser);
        return ResponseEntity.noContent().build();
    }
}
