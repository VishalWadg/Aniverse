package com.vvw.AniverseBackend;

import com.vvw.AniverseBackend.dto.PostResponseDto;
import com.vvw.AniverseBackend.entity.Comment;
import com.vvw.AniverseBackend.entity.Post;
import com.vvw.AniverseBackend.entity.User;
import com.vvw.AniverseBackend.repository.CommentRepository;
import com.vvw.AniverseBackend.repository.PostRepository;
import com.vvw.AniverseBackend.repository.UserRepository;
import com.vvw.AniverseBackend.service.PostService;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.PageRequest;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Transactional
public class PostServiceImplTest {

    @Autowired
    private PostService postService;

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private UserRepository userRepository;

    private User author;
    private UUID activePostId;
    private UUID activeCommentId;
    private UUID expiredDeletedPostId;
    private UUID recentDeletedPostId;

    @BeforeEach
    void setUp() {
        author = new User();
        author.setUsername("alice");
        author.setName("Alice");
        author.setEmail("alice@test.com");
        author.setPassword("SecurePass123!");
        author = userRepository.save(author);

        Post activePost = new Post();
        activePost.setTitle("Active Theory");
        activePost.setContent("This is still active.");
        activePost.setAuthor(author);
        Post savedActivePost = postRepository.save(activePost);
        activePostId = savedActivePost.getId();

        Comment activeComment = new Comment();
        activeComment.setContent("This comment belongs to the active post.");
        activeComment.setAuthor(author);
        activeComment.setPost(savedActivePost);
        activeCommentId = commentRepository.save(activeComment).getId();

        Post expiredDeletedPost = new Post();
        expiredDeletedPost.setTitle("Expired Deleted Theory");
        expiredDeletedPost.setContent("This should be purged.");
        expiredDeletedPost.setAuthor(author);
        expiredDeletedPost.setIsDeleted(true);
        expiredDeletedPost.setDeletedAt(LocalDateTime.now().minusDays(45));
        expiredDeletedPostId = postRepository.save(expiredDeletedPost).getId();

        Post recentDeletedPost = new Post();
        recentDeletedPost.setTitle("Recent Deleted Theory");
        recentDeletedPost.setContent("This should remain in trash.");
        recentDeletedPost.setAuthor(author);
        recentDeletedPost.setIsDeleted(true);
        recentDeletedPost.setDeletedAt(LocalDateTime.now().minusDays(5));
        recentDeletedPostId = postRepository.save(recentDeletedPost).getId();
    }

    @AfterEach
    void tearDown() {
        // Test data is rolled back after each transactional test.
    }

    @Test
    void whenDeletePostById_ThenPostMovesFromActiveToDeletedQueries() {
        postService.deletePostById(activePostId, author);
        postRepository.flush();

        assertThat(postRepository.findActiveByIdWithAuthor(activePostId)).isNotPresent();
        assertThat(postRepository.findDeletedByIdWithAuthor(activePostId)).isPresent();
    }

    @Test
    void whenDeletePostById_ThenCommentsRemainActiveButHiddenUntilPostRestore() {
        postService.deletePostById(activePostId, author);
        postRepository.flush();
        commentRepository.flush();

        Comment commentAfterPostDelete = commentRepository.findById(activeCommentId).orElseThrow();
        assertThat(commentAfterPostDelete.getIsDeleted()).isFalse();
        assertThat(commentRepository.findByPostIdWithAuthor(activePostId, PageRequest.of(0, 10)).getContent())
                .isEmpty();

        postService.restoreDeletedPost(activePostId);
        postRepository.flush();

        assertThat(commentRepository.findByPostIdWithAuthor(activePostId, PageRequest.of(0, 10)).getContent())
                .extracting(Comment::getId)
                .containsExactly(activeCommentId);
    }

    @Test
    void whenRestoreDeletedPost_ThenPostBecomesActiveAgain() {
        PostResponseDto restored = postService.restoreDeletedPost(expiredDeletedPostId);
        postRepository.flush();

        assertThat(restored.getId()).isEqualTo(expiredDeletedPostId);
        assertThat(postRepository.findActiveByIdWithAuthor(expiredDeletedPostId)).isPresent();
        assertThat(postRepository.findDeletedByIdWithAuthor(expiredDeletedPostId)).isNotPresent();
    }

    @Test
    void whenGetDeletedPosts_ThenOnlyDeletedPostsAreReturned() {
        var deletedPage = postService.getDeletedPosts(PageRequest.of(0, 10));

        assertThat(deletedPage.getTotalElements()).isEqualTo(2);
        assertThat(deletedPage.getContent()).extracting(PostResponseDto::getId)
                .containsExactlyInAnyOrder(expiredDeletedPostId, recentDeletedPostId);
    }

    @Test
    void whenPurgeExpiredDeletedPosts_ThenOnlyExpiredDeletedPostsAreRemoved() {
        int deletedCount = postService.purgeExpiredDeletedPosts();
        postRepository.flush();

        assertThat(deletedCount).isEqualTo(1);
        assertThat(postRepository.findById(expiredDeletedPostId)).isNotPresent();
        assertThat(postRepository.findDeletedByIdWithAuthor(recentDeletedPostId)).isPresent();
        assertThat(postRepository.findActiveByIdWithAuthor(activePostId)).isPresent();
    }
}
