package com.vvw.AniverseBackend.service;

import com.vvw.AniverseBackend.dto.CommentResponseDto;
import com.vvw.AniverseBackend.dto.CreateCommentDto;
import com.vvw.AniverseBackend.entity.User;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CommentService {
    Page<CommentResponseDto> getCommentsOfPost(UUID post_id, Pageable pageable);
    CommentResponseDto createComment(CreateCommentDto dto, User currentUser, UUID postId);
    CommentResponseDto updateComment(CreateCommentDto dto, UUID commentId, User currentUser);
    void deleteComment(UUID commentId, User currentUser);
}
