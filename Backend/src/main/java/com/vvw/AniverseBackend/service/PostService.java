package com.vvw.AniverseBackend.service;

import java.util.Map;
import com.vvw.AniverseBackend.dto.CreatePostDto;
import com.vvw.AniverseBackend.dto.PostResponseDto;
import com.vvw.AniverseBackend.dto.UpdatePostDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface PostService {
    Page<PostResponseDto> getAllPosts(Pageable pageable);
    PostResponseDto createNewPost(CreatePostDto createPostDto, String username);
    PostResponseDto getPostById(Long id);
    void deletePostById(Long id);
    PostResponseDto updatePost(Long id, UpdatePostDto updatePostDto);
    PostResponseDto updatePostPartially(Long id, Map<String, Object> updates);
    Page<PostResponseDto> getPostsByUsername(String username, Pageable pageable);
    Boolean isUserTheAuthor(String username, Long post_id);
}
