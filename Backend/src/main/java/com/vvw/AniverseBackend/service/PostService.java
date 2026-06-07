package com.vvw.AniverseBackend.service;

import java.util.UUID;

import com.vvw.AniverseBackend.dto.CreatePostDto;
import com.vvw.AniverseBackend.dto.PostResponseDto;
import com.vvw.AniverseBackend.dto.UpdatePostDto;
import com.vvw.AniverseBackend.entity.User;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface PostService {
    Page<PostResponseDto> getAllPosts(Pageable pageable);
    PostResponseDto createNewPost(CreatePostDto createPostDto, String username);
    PostResponseDto getPostById(UUID id);
    void deletePostById(UUID id, User currentUser);
    PostResponseDto updatePost(UUID id, UpdatePostDto updatePostDto, User currentUser);
    PostResponseDto updatePostPartially(UUID id, UpdatePostDto updates, User currentUser);
    Page<PostResponseDto> getPostsByUsername(String username, Pageable pageable);
    Boolean isUserTheAuthor(String username, UUID post_id);

    Page<PostResponseDto> getDeletedPosts(Pageable pageable);
    PostResponseDto restoreDeletedPost(UUID id);
    void purgeDeletedPost(UUID id);
    int purgeExpiredDeletedPosts();

}
