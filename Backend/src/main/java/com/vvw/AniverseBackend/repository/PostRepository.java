package com.vvw.AniverseBackend.repository;

import com.vvw.AniverseBackend.entity.User;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.vvw.AniverseBackend.entity.Post;

import java.util.Optional;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {

    // Gets a single post AND its author (Solves 1+1)
    @Query("SELECT p FROM Post p JOIN FETCH p.author WHERE p.id = :postId")
    Optional<Post> findByIdWithAuthor(@Param("postId") Long postId);

    // Optimized check for authorization (gets only the username)
    @Query("SELECT p.author.username FROM Post p WHERE p.id = :postId") // <-- Fixed p.author.name
    Optional<String> findAuthorUsernameByPostId(@Param("postId") Long postId);

    // Gets all posts AND their authors (Solves N+1)
    @Query(value = "SELECT p FROM Post p JOIN FETCH p.author",
            countQuery = "SELECT count(p) FROM Post p")
    Page<Post> findAllWithAuthor(Pageable pageable);

    // Gets a user's posts AND their authors (Solves N+1)
    @Query(value = "SELECT p FROM Post p JOIN FETCH p.author WHERE p.author.username = :username",
            countQuery = "SELECT count(p) FROM Post p WHERE p.author.username = :username")
    Page<Post> findByAuthorUsernameWithAuthor(@Param("username") String username, Pageable pageable);

    // DELETED the 'findByAuthor(User user, Pageable pageable)' method
    // as it caused an N+1 problem and is redundant.
}
