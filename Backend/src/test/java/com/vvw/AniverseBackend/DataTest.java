package com.vvw.AniverseBackend;

import com.vvw.AniverseBackend.dto.PostResponseDto;
import com.vvw.AniverseBackend.entity.User;
import com.vvw.AniverseBackend.repository.CommentRepository;
import com.vvw.AniverseBackend.service.PostService;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.PageRequest;
import com.vvw.AniverseBackend.repository.PostRepository;
import com.vvw.AniverseBackend.repository.UserRepository;

@SpringBootTest
public class DataTest {
    @Autowired
    private PostRepository postRepository;

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private PostService postService;

    @Autowired
    private UserRepository userRepository;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
        
        // Save Alice Johnson so your DataTest can find her!
        User alice = new User();
        alice.setUsername("Alice Johnson"); // Notice this test looks for the full name!
        alice.setName("Alice");               
        alice.setEmail("alice.j@test.com");     
        alice.setPassword("SecurePass123!");  
        userRepository.save(alice);
    }

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
