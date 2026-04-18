package com.vvw.AniverseBackend.service.impl;

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
import com.vvw.AniverseBackend.service.PostService;
import lombok.RequiredArgsConstructor;


@Service
@Slf4j
@RequiredArgsConstructor
public class PostServiceImpl implements PostService{
    private final PostRepository postRepository;
    private final ModelMapper modelMapper;
    private final UserService userService;

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
        return postRepository.findAll(pageable).map((element) -> modelMapper.map(element, PostResponseDto.class));
    }

    @Override
    public PostResponseDto getPostById(Long id){
        log.warn("PostServiceImpl:: getPostById");
        Post post = postRepository
            .findByIdWithAuthor(id)
            .orElseThrow(() -> new EntityNotFoundException("Post with id " + id + " not found"));
        return modelMapper.map(post, PostResponseDto.class);
    }

    @Override
    public Page<PostResponseDto> getPostsByUsername(String username, Pageable pageable){
        User user = userService.findByUsername(username);
        Page<Post> posts = postRepository.findByAuthorUsernameWithAuthor(username, pageable);
        return posts.map((element) -> modelMapper.map(element, PostResponseDto.class));
    }


    // PUT Request (All fields are required) mostly not needed as we use PATCH instead
    @Override
    public PostResponseDto updatePost(Long id, UpdatePostDto updatePostDto, User currentUser){
        log.warn("PostServiceImpl:: updatePost");
        Post post = postRepository
            .findByIdWithAuthor(id)
            .orElseThrow(() -> new EntityNotFoundException("Failed to Update :: post with id : "+ id + " does not exist"));
        assertCanModifyPost(post, currentUser);
        modelMapper.map(updatePostDto, post);
        return modelMapper.map(postRepository.save(post), PostResponseDto.class);
    }

    @Override
    public void deletePostById(Long id, User currentUser){
        log.warn("PostServiceImpl:: deletePostById");
        Post post = postRepository
            .findByIdWithAuthor(id)
            .orElseThrow(() -> new EntityNotFoundException("Failed to Update :: post with id : "+ id + " does not exist"));
        assertCanModifyPost(post, currentUser);
        postRepository.deleteById(id);
    }

    // PATCH Request all fields are not required(not notnull) and only fields with notnull value are updated others are kept as is
    // this can be done two ways using 1) Map<String, Object> and 2) using DTO with null values allowed fields 2nd approach is preferred
    @Override
    public PostResponseDto updatePostPartially(Long id, Map<String, Object> updates, User currentUser){
        log.warn("PostServiceImpl:: updatePostPartially");
        Post post = postRepository
            .findByIdWithAuthor(id)
            .orElseThrow(() -> new EntityNotFoundException("Failed to Update :: post with id : "+ id + " does not exist"));
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
}
