package com.vvw.AniverseBackend;

import com.vvw.AniverseBackend.entity.Post;
import com.vvw.AniverseBackend.entity.User;
import com.vvw.AniverseBackend.repository.PostRepository;
import com.vvw.AniverseBackend.repository.UserRepository;
import org.hibernate.Hibernate; // We need this to check for N+1
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest // This is the key annotation
//@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
public class PostRepositoryTest {

    public static final String POST_1 = "Post 1";
    @Autowired
    private PostRepository postRepository;

    @Autowired
    private UserRepository userRepository;

    private User author1;
    private User author2;
    private Post post1;
    private Post post2;
    private Post post3;

    // This method runs before each @Test, setting up fresh data
//    @BeforeEach
//    void setUp() {
//        // 1. Create and save authors
//        author1 = User.builder().username("authorOne").email("a@a.com").passwordHash("...").name("Author One").build();
//        author2 = User.builder().username("authorTwo").email("b@b.com").passwordHash("...").name("Author Two").build();
//
//        userRepository.saveAll(List.of(author1, author2));
//
//        // 2. Create and save posts
//        post1 = Post.builder().title("Post 1").content("...").author(author1).build();
//        post2 = Post.builder().title("Post 2").content("...").author(author1).build();
//        post3 = Post.builder().title("Post 3").content("...").author(author2).build();
//
//        postRepository.saveAll(List.of(post1, post2, post3));
//    }

    // Now, we write tests for each of your custom queries

    @Test
    void whenFindByIdWithAuthor_ThenReturnsPostAndAuthor() {
        // Act: Call the method we want to test
        Optional<Post> foundPost = postRepository.findByIdWithAuthor(1L);

        // Assert: Check that the post exists
        assertThat(foundPost).isPresent();
        assertThat(foundPost.get().getTitle()).isEqualTo("Exploring Ghibli Worlds");

        // Assert: Check that the author was loaded (this proves JOIN FETCH worked)
        // We check if the 'author' field is "initialized" (i.e., not a lazy proxy)
        assertThat(Hibernate.isInitialized(foundPost.get().getAuthor())).isTrue();
        assertThat(foundPost.get().getAuthor().getUsername()).isEqualTo("alice");
    }

    @Test
    void whenFindAuthorUsernameByPostId_ThenReturnsOnlyUsername() {
        // Act
        Optional<String> username = postRepository.findAuthorUsernameByPostId(1L);

        // Assert
        assertThat(username).isPresent();
        assertThat(username.get()).isEqualTo("alice");
    }

    @Test
    void whenFindAuthorUsernameByPostId_AndPostNotFound_ThenReturnsEmpty() {
        // Act
        Optional<String> username = postRepository.findAuthorUsernameByPostId(122L); // A non-existent ID

        // Assert
        assertThat(username).isNotPresent();
    }

    @Test
    void whenFindAllWithAuthor_ThenReturnsPaginatedPostsAndAuthors() {
        // Arrange: Ask for the first page, 2 items per page, sorted by title
        Pageable pageRequest = PageRequest.of(0, 2, Sort.by("title"));

        // Act
        Page<Post> postPage = postRepository.findAllWithAuthor(pageRequest);

        // Assert: Check the pagination metadata
        assertThat(postPage.getTotalElements()).isEqualTo(5);
        assertThat(postPage.getTotalPages()).isEqualTo(3);
        assertThat(postPage.getContent()).hasSize(2);
        assertThat(postPage.getContent().get(0).getTitle()).isEqualTo("Exploring Ghibli Worlds");

        // Assert: Check that ALL authors on this page were loaded (proves N+1 is solved)
        postPage.getContent().forEach(post -> {
            assertThat(Hibernate.isInitialized(post.getAuthor())).isTrue();
        });
    }

    @Test
    void whenFindByAuthorUsernameWithAuthor_ThenReturnsCorrectFilteredPage() {
        // Arrange: Ask for posts from "author1"
        Pageable pageRequest = PageRequest.of(0, 5); // Page of 5

        // Act
        Page<Post> postPage = postRepository.findByAuthorUsernameWithAuthor("alice", pageRequest);

        // Assert: Check the pagination metadata
        assertThat(postPage.getTotalElements()).isEqualTo(2); // Only 2 posts from author1
        assertThat(postPage.getTotalPages()).isEqualTo(1);    // Only 1 page
        assertThat(postPage.getContent()).hasSize(2);

        // Assert: Check that all returned posts are from the correct author
        postPage.getContent().forEach(post -> {
            assertThat(post.getAuthor().getUsername()).isEqualTo("alice");
        });
    }
}