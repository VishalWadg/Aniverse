package com.vvw.AniverseBackend.controller;

import com.vvw.AniverseBackend.dto.CreatePostDto;
import com.vvw.AniverseBackend.dto.PostResponseDto;
import com.vvw.AniverseBackend.entity.User;
import org.springframework.data.domain.Sort;
import com.vvw.AniverseBackend.service.UserService;

import jakarta.validation.Valid;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.web.PageableDefault;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
// import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.RestController;
import com.vvw.AniverseBackend.dto.UpdatePostDto;
import com.vvw.AniverseBackend.service.PostService;
import lombok.RequiredArgsConstructor;
import java.util.Map;
import java.util.Set;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.PutMapping;

@RestController
@RequiredArgsConstructor
@RequestMapping("/posts")
public class PostController {
    private final PostService postService;
    private static final Set<String> ALLOWED_SORTS = Set.of("createdAt", "wordCount");
    @GetMapping
    public ResponseEntity<Page<PostResponseDto>> getAllPosts(
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        pageable.getSort().forEach(order -> {
            if(!ALLOWED_SORTS.contains(order.getProperty())){
                throw new IllegalArgumentException("Invalid sort field: "+ order.getProperty());
            }
        });
        return ResponseEntity.ok().body(postService.getAllPosts(pageable));
    }

    @GetMapping("/deleted")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<PostResponseDto>> getDeletedPosts(
            @PageableDefault(size = 10, sort = "deletedAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok().body(postService.getDeletedPosts(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PostResponseDto> getPost(@PathVariable Long id) {
        return ResponseEntity.ok().body(postService.getPostById(id));
    }

    @PostMapping
    public ResponseEntity<PostResponseDto> createNewPost(@Valid @RequestBody CreatePostDto createPostDto,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(postService.createNewPost(createPostDto, user.getUsername()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PostResponseDto> updatePost(@PathVariable Long id, @Valid @RequestBody UpdatePostDto updatePostDto,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok().body(postService.updatePost(id, updatePostDto, currentUser));
    }

    @DeleteMapping("/{id}")
    // @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deletePost(@PathVariable Long id, @AuthenticationPrincipal User currentUser) {
        postService.deletePostById(id, currentUser);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}")
    public ResponseEntity<PostResponseDto> updatePostPartially(@PathVariable Long id,
            @RequestBody @Valid UpdatePostDto updates, @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok().body(postService.updatePostPartially(id, updates, currentUser));
    }

    @DeleteMapping("/cleanup")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Integer> cleanupExpiredPosts() {
        return ResponseEntity.ok(postService.purgeExpiredDeletedPosts());
    }

    @DeleteMapping("/cleanup/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteExpiredPost(@PathVariable Long id) {
        postService.purgeDeletedPost(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/restore/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PostResponseDto> restoreDeletedPost(@PathVariable Long id) {
        return ResponseEntity.ok(postService.restoreDeletedPost(id));
    }

    @GetMapping("/user/{username}")
    public ResponseEntity<Page<PostResponseDto>> getPostsByUser(
            @PathVariable String username,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok().body(postService.getPostsByUsername(username, pageable));
    }

}
