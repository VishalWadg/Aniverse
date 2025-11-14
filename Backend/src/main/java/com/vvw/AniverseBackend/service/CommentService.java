package com.vvw.AniverseBackend.service;

import com.vvw.AniverseBackend.dto.CommentResponseDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

//import java.util.List;

public interface CommentService {
    Page<CommentResponseDto> getCommentsOfPost(Long post_id, Pageable pageable);
}
