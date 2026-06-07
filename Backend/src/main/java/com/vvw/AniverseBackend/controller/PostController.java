package com.vvw.AniverseBackend.controller;

import com.vvw.AniverseBackend.dto.CreatePostDto;
import com.vvw.AniverseBackend.dto.PostResponseDto;
import com.vvw.AniverseBackend.entity.User;
import com.vvw.AniverseBackend.dto.UpdatePostDto;
import com.vvw.AniverseBackend.service.PostService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/posts")
public class PostController {
    private final PostService postService;

    @PostMapping
    public ResponseEntity<PostResponseDto> createNewPost(@Valid @RequestBody CreatePostDto createPostDto,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(postService.createNewPost(createPostDto, user.getUsername()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PostResponseDto> updatePost(@PathVariable UUID id, @Valid @RequestBody UpdatePostDto updatePostDto,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok().body(postService.updatePost(id, updatePostDto, currentUser));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable UUID id, @AuthenticationPrincipal User currentUser) {
        postService.deletePostById(id, currentUser);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}")
    public ResponseEntity<PostResponseDto> updatePostPartially(@PathVariable UUID id,
            @RequestBody @Valid UpdatePostDto updates, @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok().body(postService.updatePostPartially(id, updates, currentUser));
    }
}
