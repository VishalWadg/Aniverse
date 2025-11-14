package com.vvw.AniverseBackend.service.impl;

import com.vvw.AniverseBackend.dto.CommentResponseDto;
import com.vvw.AniverseBackend.repository.CommentRepository;
import com.vvw.AniverseBackend.service.CommentService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CommentServiceImpl implements CommentService {
    private final CommentRepository commentRepository;
    private final ModelMapper modelMapper;

    @Override
//    @Transactional
    public Page<CommentResponseDto> getCommentsOfPost(Long post_id, Pageable pageable){
        return commentRepository.findByPostIdWithAuthor(post_id, pageable)
                .map((element) -> modelMapper.map(element, CommentResponseDto.class));
    }
}
