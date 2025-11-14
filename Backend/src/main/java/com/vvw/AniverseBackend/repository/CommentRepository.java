package com.vvw.AniverseBackend.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.vvw.AniverseBackend.entity.Comment;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CommentRepository extends JpaRepository <Comment, Long> {
    @Query(value = "SELECT c FROM Comment c JOIN FETCH c.author WHERE c.post.id = :postId",
            countQuery = "SELECT count(c) FROM Comment c WHERE c.post.id = :postId")
    Page<Comment> findByPostIdWithAuthor(
            @Param("postId") Long postId,
            Pageable pageable
    );


}
