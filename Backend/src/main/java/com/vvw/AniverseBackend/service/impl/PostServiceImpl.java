package com.vvw.AniverseBackend.service.impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import com.vvw.AniverseBackend.dto.CreatePostDto;
import com.vvw.AniverseBackend.dto.PostResponseDto;
import com.vvw.AniverseBackend.entity.User;
import com.vvw.AniverseBackend.exceptions.EntityNotFoundException;
import com.vvw.AniverseBackend.exceptions.ResourceAccessDeniedException;
import com.vvw.AniverseBackend.mapper.PostMapper;
import com.vvw.AniverseBackend.service.UserService;
import org.springframework.transaction.annotation.Transactional;
import lombok.extern.slf4j.Slf4j;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import com.vvw.AniverseBackend.dto.UpdatePostDto;
import com.vvw.AniverseBackend.entity.Post;
import com.vvw.AniverseBackend.repository.PostRepository;
import com.vvw.AniverseBackend.exceptions.InvalidOperationException;
import com.vvw.AniverseBackend.service.PostService;
import com.vvw.AniverseBackend.config.properties.PostRetentionProperties;
import lombok.RequiredArgsConstructor;


@Service
@Slf4j
@RequiredArgsConstructor
public class PostServiceImpl implements PostService{
    private final PostRepository postRepository;
    private final PostMapper postMapper;
    private final UserService userService;
    private final PostRetentionProperties postRetentionProperties;

    private Post findDeletedPostOrThrow(UUID id) {
        return postRepository.findDeletedByIdWithAuthor(id)
                .orElseThrow(() -> new EntityNotFoundException("Deleted post with id " + id + " not found"));
    }

    private Post findActivePostOrThrow(UUID id){
        return postRepository.findActiveByIdWithAuthor(id).orElseThrow(() -> new EntityNotFoundException("Post with id "+ id + "not found"));
    }

    private void assertCanModifyPost(Post post, User currentUser){
        boolean isAuthor = post.getAuthor() != null
                && post.getAuthor().getUsername().equals(currentUser.getUsername());
        if(!isAuthor){
            throw new ResourceAccessDeniedException("You can only modify your own posts.");
        }
    }

    @Override
    @Transactional
    public PostResponseDto createNewPost(CreatePostDto createPostDto, String username){
        Post newPost = postMapper.toEntity(createPostDto);
        User author = userService.findByUsername(username);
        newPost.setAuthor(author);
        return postMapper.toPostResponseDto(postRepository.save(newPost));
    }

    @Override
    public Page<PostResponseDto> getAllPosts(Pageable pageable){
        return postRepository.findActiveWithAuthor(pageable).map((element) -> postMapper.toPostResponseDto(element));
    }

    @Override   
    public PostResponseDto getPostById(UUID id){
        log.warn("PostServiceImpl:: getPostById");
        Post post = findActivePostOrThrow(id);
        return postMapper.toPostResponseDto(post);
    }

    @Override
    public Page<PostResponseDto> getPostsByUsername(String username, Pageable pageable){
        // User user = userService.findByUsername(username);
        Page<Post> posts = postRepository.findActiveByAuthorUsernameWithAuthor(username, pageable);
        return posts.map((element) -> postMapper.toPostResponseDto(element));
    }


    // PUT Request (All fields are required) mostly not needed as we use PATCH instead
    @Override
    @Transactional
    public PostResponseDto updatePost(UUID id, UpdatePostDto updatePostDto, User currentUser){
        log.warn("PostServiceImpl:: updatePost");
        Post post = findActivePostOrThrow(id);
        assertCanModifyPost(post, currentUser);
        postMapper.updatePostFromDto(updatePostDto, post);
        return postMapper.toPostResponseDto(postRepository.save(post));
    }

    @Override
    @Transactional
    public void deletePostById(UUID id, User currentUser){
        log.warn("PostServiceImpl:: deletePostById");
        Post post = findActivePostOrThrow(id);
        assertCanModifyPost(post, currentUser);
        postRepository.delete(post);
    }

    // PATCH Request all fields are not required(not notnull) and only fields with notnull value are updated others are kept as is
    // this can be done two ways using 1) Map<String, Object> and 2) using DTO with null values allowed fields 2nd approach is preferred
    @Override
    @Transactional
    public PostResponseDto updatePostPartially(UUID id, UpdatePostDto updates, User currentUser){
        log.warn("PostServiceImpl:: updatePostPartially");
        Post post = findActivePostOrThrow(id);
        assertCanModifyPost(post, currentUser);
        postMapper.updatePostFromDto(updates, post);
        return postMapper.toPostResponseDto(postRepository.save(post));
    }

    @Override
    public Boolean isUserTheAuthor(String username, UUID post_id){
        return postRepository.findAuthorUsernameByPostId(post_id).map(authorUsername -> authorUsername.equals(username)).orElse(false);
    }

    @Override
    public Page<PostResponseDto> getDeletedPosts(Pageable pageable){
        Page<Post> posts = postRepository.findDeletedWithAuthor(pageable);
        return posts.map(element -> postMapper.toPostResponseDto(element));
    }

    @Override
    @Transactional
    public PostResponseDto restoreDeletedPost(UUID id){
        Post post = findDeletedPostOrThrow(id);
        post.setIsDeleted(false);
        post.setDeletedAt(null);
        return postMapper.toPostResponseDto(postRepository.save(post));
    }

    @Override
    @Transactional
    public void purgeDeletedPost(UUID id) {
        findDeletedPostOrThrow(id);

        int count = postRepository.hardDeleteById(id);
        if (count != 1) {
            throw new InvalidOperationException("Failed to permanently delete post with id " + id);
        }

        log.info("Post permanently deleted: {}", id);
    }

    @Override
    @Transactional
    public int purgeExpiredDeletedPosts() {
        LocalDateTime cutoff = LocalDateTime.now().minusDays(postRetentionProperties.days());
        List<UUID> ids = postRepository.findIdsDeletedBefore(cutoff);

        if (ids.isEmpty()) {
            return 0;
        }

        int deletedCount = postRepository.hardDeleteAllByIds(ids);

        if (deletedCount != ids.size()) {
            log.warn(
                "Expired post purge mismatch. Expected to delete {} posts, actually deleted {}",
                ids.size(),
                deletedCount
            );
        } else {
            log.info("Expired post purge completed. Deleted {} posts", deletedCount);
        }

        return deletedCount;
    }

}
