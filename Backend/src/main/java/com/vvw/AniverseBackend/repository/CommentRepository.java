package com.vvw.AniverseBackend.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.vvw.AniverseBackend.entity.Comment;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CommentRepository extends JpaRepository <Comment, Long> {
    @Query(value = "SELECT c FROM Comment c JOIN FETCH c.author WHERE c.post.id = :postId AND c.post.isDeleted = false AND c.isDeleted = false",
            countQuery = "SELECT count(c) FROM Comment c WHERE c.post.id = :postId AND c.post.isDeleted = false AND c.isDeleted = false")
    Page<Comment> findByPostIdWithAuthor(
            @Param("postId") Long postId,
            Pageable pageable
    );

    @Query("SELECT c FROM Comment c JOIN FETCH c.author JOIN c.post p WHERE c.id = :id AND c.isDeleted = false AND p.isDeleted = false")
    Optional<Comment> findActiveCommentById(@Param("id") Long id);

}
