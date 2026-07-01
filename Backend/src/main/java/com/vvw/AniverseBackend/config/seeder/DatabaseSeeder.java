package com.vvw.AniverseBackend.config.seeder;

import com.vvw.AniverseBackend.entity.Comment;
import com.vvw.AniverseBackend.entity.Post;
import com.vvw.AniverseBackend.entity.User;
import com.vvw.AniverseBackend.entity.type.Role;
import com.vvw.AniverseBackend.repository.CommentRepository;
import com.vvw.AniverseBackend.repository.PostRepository;
import com.vvw.AniverseBackend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
@Profile("dev")
public class DatabaseSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final PasswordEncoder passwordEncoder;

    public DatabaseSeeder(UserRepository userRepository,
                          PostRepository postRepository,
                          CommentRepository commentRepository,
                          PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.postRepository = postRepository;
        this.commentRepository = commentRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional // Wrap in a transaction to handle relationship cascades properly
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) {
            System.out.println(">>> Database is empty. Seeding development data...");
            seedData();
            System.out.println(">>> Seeding completed successfully!");
        } else {
            System.out.println(">>> Database already has records. Skipping seeding.");
        }
    }

    private void seedData() {
        // 1. Create Users (IDs are null, Hibernate will auto-generate UUIDs)
        User alice = User.builder()
                .name("Alice Johnson")
                .username("alice")
                .email("alice@example.com")
                .password(passwordEncoder.encode("hash1234"))
                .profilePic("alice.jpg")
                .bio("Loves writing about anime and tech.")
                .role(Role.ADMIN)
                .build();

        User bob = User.builder()
                .name("Bob Smith")
                .username("bob")
                .email("bob@example.com")
                .password(passwordEncoder.encode("hash4564"))
                .profilePic("bob.png")
                .bio("Casual writer and commenter.")
                .role(Role.USER)
                .build();

        User charlie = User.builder()
                .name("Charlie Brown")
                .username("charlie")
                .email("charlie@example.com")
                .password(passwordEncoder.encode("hash7890"))
                .bio("Just here to read interesting posts.")
                .role(Role.USER)
                .build();

        // Save users so they get their IDs generated
        userRepository.saveAll(List.of(alice, bob, charlie));

        // 2. Create Posts linked directly to the saved User objects
        Post post1 = Post.builder()
                .title("Exploring Ghibli Worlds")
                .content("A deep dive into the magic of Studio Ghibli.")
                .isDeleted(true)
                .deletedAt(LocalDateTime.now())
                .author(alice) // Linked via reference
                .build();

        Post post2 = Post.builder()
                .title("Why Attack on Titan’s Ending Works")
                .content("A breakdown of symbolism and character arcs.")
                .isDeleted(false)
                .author(alice)
                .build();

        Post post3 = Post.builder()
                .title("How I Learned Java the Hard Way")
                .content("A story of failed projects and persistence.")
                .isDeleted(false)
                .author(bob)
                .build();

        Post post4 = Post.builder()
                .title("Top 5 Underrated Anime of 2020")
                .content("You might have missed these gems.")
                .isDeleted(true)
                .deletedAt(LocalDateTime.now())
                .author(bob)
                .build();

        Post post5 = Post.builder()
                .title("Worldbuilding Tips for Writers")
                .content("How to create immersive fictional universes.")
                .isDeleted(false)
                .author(charlie)
                .build();

        postRepository.saveAll(List.of(post1, post2, post3, post4, post5));

        // 3. Create Comments linked directly to Post and User objects
        Comment comment1 = Comment.builder()
                .content("Totally agree! Spirited Away is timeless.")
                .isDeleted(false)
                .post(post1)
                .author(bob)
                .build();

        Comment comment2 = Comment.builder()
                .content("Interesting analysis, though I prefer Mononoke.")
                .isDeleted(false)
                .post(post1)
                .author(charlie)
                .build();

        Comment comment3 = Comment.builder()
                .content("Ghibli truly shaped our childhoods.")
                .isDeleted(false)
                .post(post1)
                .author(alice)
                .build();

        Comment comment4 = Comment.builder()
                .content("The symbolism of freedom really hit me.")
                .isDeleted(false)
                .post(post2)
                .author(charlie)
                .build();

        Comment comment5 = Comment.builder()
                .content("Nice take, but I think Titan’s ending could be better.")
                .isDeleted(false)
                .post(post2)
                .author(bob)
                .build();

        Comment comment6 = Comment.builder()
                .content("This helped me fix my first Spring Boot bug. Thanks!")
                .isDeleted(false)
                .post(post3)
                .author(alice)
                .build();

        Comment comment7 = Comment.builder()
                .content("You explained the learning curve perfectly.")
                .isDeleted(false)
                .post(post3)
                .author(charlie)
                .build();

        Comment comment8 = Comment.builder()
                .content("Love underrated recommendations! Found 2 new shows.")
                .isDeleted(false)
                .post(post4)
                .author(charlie)
                .build();

        Comment comment9 = Comment.builder()
                .content("Great points about pacing and tone!")
                .isDeleted(false)
                .post(post5)
                .author(bob)
                .build();

        Comment comment10 = Comment.builder()
                .content("Well-written! I’d love to see a part 2.")
                .isDeleted(false)
                .post(post5)
                .author(alice)
                .build();

        commentRepository.saveAll(List.of(
                comment1, comment2, comment3, comment4, comment5,
                comment6, comment7, comment8, comment9, comment10
        ));
    }
}