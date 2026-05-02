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

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Transactional 
public class PostRepositoryTest {

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private UserRepository userRepository;

    private Long ghibliPostId;
    private Long deletedPostId;

    @BeforeEach
    void setUp() {
        User alice = new User();
        alice.setUsername("alice"); 
        alice.setName("Alice");               
        alice.setEmail("alice@test.com");     
        alice.setPassword("SecurePass123!");  
        userRepository.save(alice);

        User bob = new User();
        bob.setUsername("bob"); 
        bob.setName("Bob");               
        bob.setEmail("bob@test.com");     
        bob.setPassword("SecurePass123!");  
        userRepository.save(bob);

        Post post1 = new Post();
        post1.setTitle("Exploring Ghibli Worlds");
        post1.setContent("Totoro is the best movie ever made.");
        post1.setAuthor(alice);
        ghibliPostId = postRepository.save(post1).getId();

        Post post2 = new Post();
        post2.setTitle("Naruto Theories");
        post2.setContent("Sasuke's redemption arc.");
        post2.setAuthor(alice);
        postRepository.save(post2);

        for (int i = 3; i <= 5; i++) {
            Post post = new Post();
            post.setTitle("Z Anime Review " + i);
            post.setContent("Some review content.");
            post.setAuthor(bob);
            postRepository.save(post);
        }

        Post deletedPost = new Post();
        deletedPost.setTitle("Deleted Editorial");
        deletedPost.setContent("This post should live only in trash queries.");
        deletedPost.setAuthor(alice);
        deletedPost.setIsDeleted(true);
        deletedPost.setDeletedAt(LocalDateTime.now().minusDays(45));
        deletedPostId = postRepository.save(deletedPost).getId();
    }

    @AfterEach
    void tearDown() {
        // Test data is rolled back after each transactional test.
    }

    @Test
    void whenFindActiveByIdWithAuthor_ThenReturnsPostAndAuthor() {
        Optional<Post> foundPost = postRepository.findActiveByIdWithAuthor(ghibliPostId);

        assertThat(foundPost).isPresent();
        assertThat(foundPost.get().getTitle()).isEqualTo("Exploring Ghibli Worlds");
        assertThat(Hibernate.isInitialized(foundPost.get().getAuthor())).isTrue();
        assertThat(foundPost.get().getAuthor().getUsername()).isEqualTo("alice");
    }

    @Test
    void whenFindAuthorUsernameByPostId_ThenReturnsOnlyUsername() {
        Optional<String> username = postRepository.findAuthorUsernameByPostId(ghibliPostId);

        assertThat(username).isPresent();
        assertThat(username.get()).isEqualTo("alice");
    }

    @Test
    void whenFindAuthorUsernameByPostId_AndPostIsDeleted_ThenReturnsEmpty() {
        Optional<String> username = postRepository.findAuthorUsernameByPostId(deletedPostId);
        assertThat(username).isNotPresent();
    }

    @Test
    void whenFindActiveWithAuthor_ThenReturnsOnlyActivePaginatedPostsAndAuthors() {
        Pageable pageRequest = PageRequest.of(0, 2, Sort.by("title"));
        Page<Post> postPage = postRepository.findActiveWithAuthor(pageRequest);

        assertThat(postPage.getTotalElements()).isEqualTo(5);
        assertThat(postPage.getTotalPages()).isEqualTo(3);
        assertThat(postPage.getContent()).hasSize(2);
        assertThat(postPage.getContent().get(0).getTitle()).isEqualTo("Exploring Ghibli Worlds");
        
        postPage.getContent().forEach(post -> {
            assertThat(Hibernate.isInitialized(post.getAuthor())).isTrue();
        });
    }

    @Test
    void whenFindActiveByAuthorUsernameWithAuthor_ThenReturnsCorrectFilteredActivePage() {
        Pageable pageRequest = PageRequest.of(0, 5); 
        Page<Post> postPage = postRepository.findActiveByAuthorUsernameWithAuthor("alice", pageRequest);

        assertThat(postPage.getTotalElements()).isEqualTo(2); 
        assertThat(postPage.getTotalPages()).isEqualTo(1);    
        assertThat(postPage.getContent()).hasSize(2);

        postPage.getContent().forEach(post -> {
            assertThat(post.getAuthor().getUsername()).isEqualTo("alice");
        });
    }

    @Test
    void whenFindDeletedWithAuthor_ThenReturnsOnlyDeletedPosts() {
        Pageable pageRequest = PageRequest.of(0, 10);
        Page<Post> postPage = postRepository.findDeletedWithAuthor(pageRequest);

        assertThat(postPage.getTotalElements()).isEqualTo(1);
        assertThat(postPage.getContent()).hasSize(1);
        assertThat(postPage.getContent().get(0).getId()).isEqualTo(deletedPostId);
        assertThat(postPage.getContent().get(0).getIsDeleted()).isTrue();
        assertThat(Hibernate.isInitialized(postPage.getContent().get(0).getAuthor())).isTrue();
    }

    @Test
    void whenFindDeletedByIdWithAuthor_ThenReturnsDeletedPostAndAuthor() {
        Optional<Post> foundPost = postRepository.findDeletedByIdWithAuthor(deletedPostId);

        assertThat(foundPost).isPresent();
        assertThat(foundPost.get().getIsDeleted()).isTrue();
        assertThat(foundPost.get().getDeletedAt()).isNotNull();
        assertThat(foundPost.get().getAuthor().getUsername()).isEqualTo("alice");
    }

    @Test
    void whenFindIdsDeletedBefore_ThenReturnsOnlyExpiredDeletedIds() {
        LocalDateTime cutoff = LocalDateTime.now().minusDays(30);

        assertThat(postRepository.findIdsDeletedBefore(cutoff)).containsExactly(deletedPostId);
    }

    @Test
    void whenHardDeleteById_ThenPhysicallyRemovesDeletedPost() {
        int deletedCount = postRepository.hardDeleteById(deletedPostId);

        assertThat(deletedCount).isEqualTo(1);
        assertThat(postRepository.findById(deletedPostId)).isNotPresent();
    }
}
