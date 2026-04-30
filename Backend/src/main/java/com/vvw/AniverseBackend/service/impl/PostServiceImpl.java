package com.vvw.AniverseBackend.service.impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import com.vvw.AniverseBackend.dto.CreatePostDto;
import com.vvw.AniverseBackend.dto.PostResponseDto;
import com.vvw.AniverseBackend.entity.User;
import com.vvw.AniverseBackend.exceptions.EntityNotFoundException;
import com.vvw.AniverseBackend.exceptions.ResourceAccessDeniedException;
import com.vvw.AniverseBackend.service.UserService;
import org.springframework.transaction.annotation.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
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
    private final ModelMapper modelMapper;
    private final UserService userService;
    private final PostRetentionProperties postRetentionProperties;

    private Post findDeletedPostOrThrow(Long id) {
        return postRepository.findDeletedByIdWithAuthor(id)
                .orElseThrow(() -> new EntityNotFoundException("Deleted post with id " + id + " not found"));
    }

    private Post findActivePostOrThrow(Long id){
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
        Post newPost = modelMapper.map(createPostDto, Post.class);
        User author = userService.findByUsername(username);
        newPost.setAuthor(author);
        return modelMapper.map(postRepository.save(newPost), PostResponseDto.class);
    }

    @Override
    public Page<PostResponseDto> getAllPosts(Pageable pageable){
        return postRepository.findActiveWithAuthor(pageable).map((element) -> modelMapper.map(element, PostResponseDto.class));
    }

    @Override   
    public PostResponseDto getPostById(Long id){
        log.warn("PostServiceImpl:: getPostById");
        Post post = findActivePostOrThrow(id);
        return modelMapper.map(post, PostResponseDto.class);
    }

    @Override
    public Page<PostResponseDto> getPostsByUsername(String username, Pageable pageable){
        // User user = userService.findByUsername(username);
        Page<Post> posts = postRepository.findActiveByAuthorUsernameWithAuthor(username, pageable);
        return posts.map((element) -> modelMapper.map(element, PostResponseDto.class));
    }


    // PUT Request (All fields are required) mostly not needed as we use PATCH instead
    @Override
    @Transactional
    public PostResponseDto updatePost(Long id, UpdatePostDto updatePostDto, User currentUser){
        log.warn("PostServiceImpl:: updatePost");
        Post post = findActivePostOrThrow(id);
        assertCanModifyPost(post, currentUser);
        modelMapper.map(updatePostDto, post);
        return modelMapper.map(postRepository.save(post), PostResponseDto.class);
    }

    @Override
    @Transactional
    public void deletePostById(Long id, User currentUser){
        log.warn("PostServiceImpl:: deletePostById");
        Post post = findActivePostOrThrow(id);
        assertCanModifyPost(post, currentUser);
        postRepository.delete(post);
    }

    // PATCH Request all fields are not required(not notnull) and only fields with notnull value are updated others are kept as is
    // this can be done two ways using 1) Map<String, Object> and 2) using DTO with null values allowed fields 2nd approach is preferred
    @Override
    @Transactional
    public PostResponseDto updatePostPartially(Long id, Map<String, Object> updates, User currentUser){
        log.warn("PostServiceImpl:: updatePostPartially");
        Post post = findActivePostOrThrow(id);
        assertCanModifyPost(post, currentUser);
        updates.forEach((field, value)->{
            switch (field) {
                case "title":
                    post.setTitle((String)value);
                    break;
                case "content":
                    post.setContent((String)value);
                    break;
                default:
                    throw new IllegalArgumentException("PostServiceImpl :: updatePostPartially :: field Not supported");
                    // break;
            }
        });
        return modelMapper.map(postRepository.save(post), PostResponseDto.class);
    }

    @Override
    public Boolean isUserTheAuthor(String username, Long post_id){
        return postRepository.findAuthorUsernameByPostId(post_id).map(authorUsername -> authorUsername.equals(username)).orElse(false);
    }

    @Override
    public Page<PostResponseDto> getDeletedPosts(Pageable pageable){
        Page<Post> posts = postRepository.findDeletedWithAuthor(pageable);
        return posts.map(element -> modelMapper.map(element, PostResponseDto.class));
    }

    @Override
    @Transactional
    public PostResponseDto restoreDeletedPost(Long id){
        Post post = findDeletedPostOrThrow(id);
        post.setIsDeleted(false);
        post.setDeletedAt(null);
        return modelMapper.map(postRepository.save(post), PostResponseDto.class);
    }

    @Override
    @Transactional
    public void purgeDeletedPost(Long id) {
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
        List<Long> ids = postRepository.findIdsDeletedBefore(cutoff);

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
