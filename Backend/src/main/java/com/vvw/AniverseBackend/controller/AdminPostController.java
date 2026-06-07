package com.vvw.AniverseBackend.controller;

import com.vvw.AniverseBackend.dto.PostResponseDto;
import com.vvw.AniverseBackend.service.PostService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/admin/posts")
public class AdminPostController {
    private final PostService postService;

    @GetMapping("/deleted")
    public ResponseEntity<Page<PostResponseDto>> getDeletedPosts(
            @PageableDefault(size = 10, sort = "deletedAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(postService.getDeletedPosts(pageable));
    }

    @PutMapping("/restore/{id}")
    public ResponseEntity<PostResponseDto> restoreDeletedPost(@PathVariable UUID id) {
        return ResponseEntity.ok(postService.restoreDeletedPost(id));
    }

    @DeleteMapping("/cleanup")
    public ResponseEntity<Integer> cleanupExpiredPosts() {
        return ResponseEntity.ok(postService.purgeExpiredDeletedPosts());
    }

    @DeleteMapping("/cleanup/{id}")
    public ResponseEntity<Void> deleteExpiredPost(@PathVariable UUID id) {
        postService.purgeDeletedPost(id);
        return ResponseEntity.noContent().build();
    }
}
