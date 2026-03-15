package com.vvw.AniverseBackend;

import com.vvw.AniverseBackend.entity.Post;
import com.vvw.AniverseBackend.entity.User;
import com.vvw.AniverseBackend.repository.PostRepository;
import com.vvw.AniverseBackend.repository.UserRepository;

import jakarta.transaction.Transactional;

import org.hibernate.Hibernate;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Transactional 
public class PostRepositoryTest {

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private UserRepository userRepository;

    @BeforeEach
    void setUp() {
        postRepository.deleteAll();
        userRepository.deleteAll();

        // 1. Create Alice (Your tests expect her to have exactly 2 posts)
        User alice = new User();
        alice.setUsername("alice"); 
        alice.setName("Alice");               
        alice.setEmail("alice@test.com");     
        alice.setPassword("SecurePass123!");  
        userRepository.save(alice);

        // 2. Create Bob (To make the total post count = 5 for your pagination test)
        User bob = new User();
        bob.setUsername("bob"); 
        bob.setName("Bob");               
        bob.setEmail("bob@test.com");     
        bob.setPassword("SecurePass123!");  
        userRepository.save(bob);

        // 3. Create Alice's 2 Posts (ADDING CONTENT SO THE DB DOESN'T CRASH)
        Post post1 = new Post();
        post1.setTitle("Exploring Ghibli Worlds"); // Test looks for this exact title!
        post1.setContent("Totoro is the best movie ever made.");
        post1.setAuthor(alice);
        postRepository.save(post1);

        Post post2 = new Post();
        post2.setTitle("Naruto Theories");
        post2.setContent("Sasuke's redemption arc.");
        post2.setAuthor(alice);
        postRepository.save(post2);

        // 4. Create Bob's 3 Posts (To reach the expected 5 total posts)
        for (int i = 3; i <= 5; i++) {
            Post post = new Post();
            post.setTitle("Z Anime Review " + i); // Starts with Z so it sorts to the end
            post.setContent("Some review content.");
            post.setAuthor(bob);
            postRepository.save(post);
        }
    }

    @AfterEach
    void tearDown() {
        postRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void whenFindByIdWithAuthor_ThenReturnsPostAndAuthor() {
        // Dynamically find the ID of the Ghibli post instead of hardcoding 1L
        Long ghibliId = postRepository.findAll().stream()
                .filter(p -> p.getTitle().equals("Exploring Ghibli Worlds"))
                .findFirst().get().getId();

        Optional<Post> foundPost = postRepository.findByIdWithAuthor(ghibliId);

        assertThat(foundPost).isPresent();
        assertThat(foundPost.get().getTitle()).isEqualTo("Exploring Ghibli Worlds");
        assertThat(Hibernate.isInitialized(foundPost.get().getAuthor())).isTrue();
        assertThat(foundPost.get().getAuthor().getUsername()).isEqualTo("alice");
    }

    @Test
    void whenFindAuthorUsernameByPostId_ThenReturnsOnlyUsername() {
        // Dynamically get Alice's post ID
        Long alicePostId = postRepository.findAll().stream()
                .filter(p -> p.getAuthor().getUsername().equals("alice"))
                .findFirst().get().getId();

        Optional<String> username = postRepository.findAuthorUsernameByPostId(alicePostId);

        assertThat(username).isPresent();
        assertThat(username.get()).isEqualTo("alice");
    }

    @Test
    void whenFindAuthorUsernameByPostId_AndPostNotFound_ThenReturnsEmpty() {
        Optional<String> username = postRepository.findAuthorUsernameByPostId(9999L); // Safely fake ID
        assertThat(username).isNotPresent();
    }

    @Test
    void whenFindAllWithAuthor_ThenReturnsPaginatedPostsAndAuthors() {
        Pageable pageRequest = PageRequest.of(0, 2, Sort.by("title"));
        Page<Post> postPage = postRepository.findAllWithAuthor(pageRequest);

        assertThat(postPage.getTotalElements()).isEqualTo(5);
        assertThat(postPage.getTotalPages()).isEqualTo(3);
        assertThat(postPage.getContent()).hasSize(2);
        assertThat(postPage.getContent().get(0).getTitle()).isEqualTo("Exploring Ghibli Worlds");
        
        postPage.getContent().forEach(post -> {
            assertThat(Hibernate.isInitialized(post.getAuthor())).isTrue();
        });
    }

    @Test
    void whenFindByAuthorUsernameWithAuthor_ThenReturnsCorrectFilteredPage() {
        Pageable pageRequest = PageRequest.of(0, 5); 
        Page<Post> postPage = postRepository.findByAuthorUsernameWithAuthor("alice", pageRequest);

        assertThat(postPage.getTotalElements()).isEqualTo(2); 
        assertThat(postPage.getTotalPages()).isEqualTo(1);    
        assertThat(postPage.getContent()).hasSize(2);

        postPage.getContent().forEach(post -> {
            assertThat(post.getAuthor().getUsername()).isEqualTo("alice");
        });
    }
}