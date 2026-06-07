package com.vvw.AniverseBackend.repository;

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
import java.util.UUID;

@Repository
public interface PostRepository extends JpaRepository<Post, UUID> {

    @Query("SELECT p FROM Post p JOIN FETCH p.author WHERE p.id = :postId AND p.isDeleted = false")
    Optional<Post> findActiveByIdWithAuthor(@Param("postId") UUID postId);

    @Query("SELECT p.author.username FROM Post p WHERE p.id = :postId AND p.isDeleted = false")
    Optional<String> findAuthorUsernameByPostId(@Param("postId") UUID postId);

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
    Optional<Post> findDeletedByIdWithAuthor(@Param("postId") UUID postId);

    @Query("SELECT p.id FROM Post p WHERE p.isDeleted = true AND p.deletedAt < :cutoff")
    List<UUID> findIdsDeletedBefore(@Param("cutoff") LocalDateTime cutoff);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("DELETE FROM Post p WHERE p.id = :postId AND p.isDeleted = true")
    int hardDeleteById(@Param("postId") UUID postId);

    @Query("SELECT COUNT(p) FROM Post p WHERE p.isDeleted = true AND p.deletedAt < :cutoff")
    long countExpiredPosts(@Param("cutoff") LocalDateTime cutoff);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("DELETE FROM Post p WHERE p.isDeleted = true AND p.deletedAt < :cutoff")
    int purgeExpiredPosts(@Param("cutoff") LocalDateTime cutoff);


    @Query(value = "SELECT p FROM Post p JOIN FETCH p.author WHERE " + 
                     "p.isDeleted = false AND " +
                     "(LOWER(p.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " + 
                     "LOWER(p.content) LIKE LOWER(CONCAT('%', :query, '%')))",
              countQuery = "SELECT count(p) FROM Post p WHERE " + 
                     "p.isDeleted = false AND " +
                     "(LOWER(p.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " + 
                     "LOWER(p.content) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Post> searchActivePosts(@Param("query") String query, Pageable pageable);


}
