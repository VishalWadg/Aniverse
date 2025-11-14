package com.vvw.AniverseBackend;

import com.vvw.AniverseBackend.dto.PostDto;
import com.vvw.AniverseBackend.dto.PostResponseDto;
import com.vvw.AniverseBackend.entity.Comment;
import com.vvw.AniverseBackend.repository.CommentRepository;
import com.vvw.AniverseBackend.service.PostService;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.junit.jupiter.api.Assertions;
// import org.junit.jupiter.api.AutoClose;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.PageRequest;

import com.vvw.AniverseBackend.entity.Post;
import com.vvw.AniverseBackend.repository.PostRepository;

import java.util.List;

@SpringBootTest
public class DataTest {
    @Autowired
    private PostRepository postRepository;

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private PostService postService;

    @Test
    @Transactional
    public void testPost(){

        Page<PostResponseDto> posts = postService.getPostsByUsername("Alice Johnson", PageRequest.of(0, 3));

        posts.getContent().forEach((post) -> {
            System.out.println(post);
            Long id = post.getId();
            System.out.println(postService.isUserTheAuthor("Alice Johnson",id));

        });
    }
}
