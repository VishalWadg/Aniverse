package com.vvw.AniverseBackend.repository;

import com.vvw.AniverseBackend.entity.User;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.vvw.AniverseBackend.entity.Post;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {

    @Query("SELECT p FROM Post p JOIN FETCH p.author WHERE p.id = :postId AND p.isDeleted = false")
    Optional<Post> findActiveByIdWithAuthor(@Param("postId") Long postId);

    @Query("SELECT p.author.username FROM Post p WHERE p.id = :postId AND p.isDeleted = false")
    Optional<String> findAuthorUsernameByPostId(@Param("postId") Long postId);

    @Query(value = "SELECT p FROM Post p JOIN FETCH p.author WHERE p.isDeleted = false",
           countQuery = "SELECT count(p) FROM Post p WHERE p.isDeleted = false")
    Page<Post> findActiveWithAuthor(Pageable pageable);

    @Query(value = "SELECT p FROM Post p JOIN FETCH p.author WHERE p.author.username = :username AND p.isDeleted = false",
           countQuery = "SELECT count(p) FROM Post p WHERE p.author.username = :username AND p.isDeleted = false")
    Page<Post> findActiveByAuthorUsernameWithAuthor(@Param("username") String username, Pageable pageable);

    long countByAuthorUsernameAndIsDeletedFalse(String username);

    @Query(value = "SELECT p FROM Post p JOIN FETCH p.author WHERE p.isDeleted = true",
           countQuery = "SELECT count(p) FROM Post p WHERE p.isDeleted = true")
    Page<Post> findDeletedWithAuthor(Pageable pageable);

    @Query("SELECT p FROM Post p JOIN FETCH p.author WHERE p.id = :postId AND p.isDeleted = true")
    Optional<Post> findDeletedByIdWithAuthor(@Param("postId") Long postId);

    @Query("SELECT p.id FROM Post p WHERE p.isDeleted = true AND p.deletedAt < :cutoff")
    List<Long> findIdsDeletedBefore(@Param("cutoff") LocalDateTime cutoff);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("DELETE FROM Post p WHERE p.id = :postId AND p.isDeleted = true")
    int hardDeleteById(@Param("postId") Long postId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("DELETE FROM Post p WHERE p.id IN :postIds AND p.isDeleted = true")
    int hardDeleteAllByIds(@Param("postIds") List<Long> postIds);
}
