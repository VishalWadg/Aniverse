package com.vvw.AniverseBackend.service.impl;

import java.util.List;
import java.util.Map;

import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import com.vvw.AniverseBackend.dto.PostDto;
import com.vvw.AniverseBackend.dto.UpdatePostDto;
import com.vvw.AniverseBackend.entity.Post;
import com.vvw.AniverseBackend.repository.PostRepository;
import com.vvw.AniverseBackend.service.PostService;

import lombok.RequiredArgsConstructor;


@Service
@RequiredArgsConstructor
public class PostServiceImpl implements PostService{
    private final PostRepository postRepository;
    private final ModelMapper modelMapper;

    @Override
    public PostDto createNewPost(UpdatePostDto updatePostDto){
        Post newPost = modelMapper.map(updatePostDto, Post.class);
        return modelMapper.map(postRepository.save(newPost), PostDto.class);
    }

    @Override
    public List<PostDto> getAllPosts(){
        return postRepository
            .findAll()
            .stream()
            .map((post) -> modelMapper.map(post, PostDto.class))
            .toList();
    }

    @Override
    public PostDto getPostById(Long id){
        Post post = postRepository
            .findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Post with id "+id+" not found"));
        return modelMapper.map(post, PostDto.class);
    }

    @Override
    public PostDto updatePost(Long id, UpdatePostDto updatePostDto){
        Post post = postRepository
            .findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Error :: PostServiceImpl :: updatePost :: post with id : "+ id + " does not exist"));
        modelMapper.map(updatePostDto, post);
        return modelMapper.map(postRepository.save(post), PostDto.class);
    }

    @Override
    public void deletePostById(Long id){
        if(!postRepository.existsById(id)){
            throw new IllegalArgumentException("post with id : " + id + "  not found");
        }
        postRepository.deleteById(id);
    }

    @Override
    public PostDto updatePostPartially(Long id, Map<String, Object> updates){
        Post post = postRepository
            .findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Error :: PostServiceImpl :: updatePostPartially :: post with id : "+ id + " does not exist"));
        
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
        return modelMapper.map(postRepository.save(post), PostDto.class);
    }
}
