package com.vvw.AniverseBackend.service.impl;

import com.vvw.AniverseBackend.dto.CommentResponseDto;
import com.vvw.AniverseBackend.dto.CreateCommentDto;
import com.vvw.AniverseBackend.entity.Comment;
import com.vvw.AniverseBackend.entity.Post;
import com.vvw.AniverseBackend.entity.User;
import com.vvw.AniverseBackend.exceptions.EntityNotFoundException;
import com.vvw.AniverseBackend.exceptions.ResourceAccessDeniedException;
import com.vvw.AniverseBackend.mapper.CommentMapper;
import com.vvw.AniverseBackend.repository.CommentRepository;
import com.vvw.AniverseBackend.repository.PostRepository;
import com.vvw.AniverseBackend.repository.UserRepository;
import com.vvw.AniverseBackend.service.CommentService;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CommentServiceImpl implements CommentService {
    private final CommentRepository commentRepository;
    private final CommentMapper commentMapper;
    private final PostRepository postRepository;
    private final UserRepository userRepository;

    private void assertCanModifyComment(Comment comment, User currentUser){
        boolean isAuthor = comment.getAuthor() != null
                && comment.getAuthor().getUsername().equals(currentUser.getUsername());
        if(!isAuthor){
            throw new ResourceAccessDeniedException("You can only modify your own comments.");
        }
    }

    @Override
    public Page<CommentResponseDto> getCommentsOfPost(Long post_id, Pageable pageable){
        if(!postRepository.existsById(post_id)){
            throw new EntityNotFoundException("Post Not found with id : "+ post_id);
        }
        return commentRepository.findByPostIdWithAuthor(post_id, pageable)
                .map((element) -> commentMapper.toCommentResponseDto(element));
    }

    @Override
    @Transactional
    public CommentResponseDto createComment(CreateCommentDto dto, User currentUser, Long postId){
        Post post = postRepository.findActiveByIdWithAuthor(postId).orElseThrow(() -> new EntityNotFoundException("Post Not found with id : "+ postId));
        Comment comment = commentMapper.toEntity(dto);
        comment.setPost(post);
        comment.setAuthor(currentUser);
        post.getComments().add(comment);
        Comment savedComment = commentRepository.save(comment);
        return commentMapper.toCommentResponseDto(savedComment);
    }

    @Override
    @Transactional
    public CommentResponseDto updateComment(CreateCommentDto dto, Long commentId, User currentUser){
        Comment comment = commentRepository.findActiveCommentById(commentId).orElseThrow(() -> new EntityNotFoundException("Comment not found with id : " + commentId));
        assertCanModifyComment(comment, currentUser);
        commentMapper.updateCommentFromDto(dto, comment);
        return commentMapper.toCommentResponseDto(commentRepository.save(comment));
    }

    @Override
    @Transactional
    public void deleteComment(Long commentId, User currentUser){
        Comment comment = commentRepository.findActiveCommentById(commentId).orElseThrow(() -> new EntityNotFoundException("Comment not found."));
        assertCanModifyComment(comment, currentUser);
        commentRepository.delete(comment);
    }
}
