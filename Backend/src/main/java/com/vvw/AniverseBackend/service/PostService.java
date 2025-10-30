package com.vvw.AniverseBackend.service;

import java.util.List;
import java.util.Map;

import com.vvw.AniverseBackend.dto.PostDto;
import com.vvw.AniverseBackend.dto.UpdatePostDto;

public interface PostService {
    List<PostDto>getAllPosts();
    PostDto createNewPost(UpdatePostDto updatePostDto);
    PostDto getPostById(Long id);
    void deletePostById(Long id);
    PostDto updatePost(Long id, UpdatePostDto updatePostDto);
    PostDto updatePostPartially(Long id, Map<String, Object> updates);
}
