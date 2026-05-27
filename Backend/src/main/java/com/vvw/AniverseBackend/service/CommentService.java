package com.vvw.AniverseBackend.service;

import com.vvw.AniverseBackend.dto.CommentResponseDto;
import com.vvw.AniverseBackend.dto.CreateCommentDto;
import com.vvw.AniverseBackend.entity.User;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CommentService {
    Page<CommentResponseDto> getCommentsOfPost(Long post_id, Pageable pageable);
    CommentResponseDto createComment(CreateCommentDto dto, User currentUser, Long postId);
    CommentResponseDto updateComment(CreateCommentDto dto, Long commentId, User currentUser);
    void deleteComment(Long commentId, User currentUser);
}
