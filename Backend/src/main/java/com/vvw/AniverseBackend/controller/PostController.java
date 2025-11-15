package com.vvw.AniverseBackend.controller;

import com.vvw.AniverseBackend.dto.CreatePostDto;
import com.vvw.AniverseBackend.dto.PostResponseDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.RestController;
import com.vvw.AniverseBackend.dto.UpdatePostDto;
import com.vvw.AniverseBackend.service.PostService;
import lombok.RequiredArgsConstructor;
import java.util.Map;
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
    
    @GetMapping
    public ResponseEntity<Page<PostResponseDto>> getAllPosts() {
        return ResponseEntity.ok().body(postService.getAllPosts(PageRequest.of(0, 5)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PostResponseDto> getPost(@PathVariable Long id) {
        return ResponseEntity.ok().body(postService.getPostById(id));
    }

    @PostMapping
    public ResponseEntity<PostResponseDto> createNewPost (@RequestBody CreatePostDto createPostDto, String username) {
        return ResponseEntity.status(HttpStatus.CREATED).body(postService.createNewPost(createPostDto, username));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<PostResponseDto> updatePost(@PathVariable Long id, @RequestBody UpdatePostDto updatePostDto) {
        return ResponseEntity.ok().body(postService.updatePost(id, updatePostDto));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable Long id){
        postService.deletePostById(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}")
    public ResponseEntity<PostResponseDto> updatePostPartially(@PathVariable Long id, @RequestBody Map<String, Object> updates){
        return ResponseEntity.ok().body(postService.updatePostPartially(id, updates));
    }
    
}
