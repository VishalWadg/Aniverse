package com.vvw.AniverseBackend.controller;

import com.vvw.AniverseBackend.dto.FeedbackRequestDto;
import com.vvw.AniverseBackend.dto.FeedbackResponseDto;
import com.vvw.AniverseBackend.dto.TagDto;
import com.vvw.AniverseBackend.service.FeedbackService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/feedbacks")
@RequiredArgsConstructor
public class FeedbackController {

    private final FeedbackService feedbackService;

    @PostMapping
    public ResponseEntity<FeedbackResponseDto> submitFeedback(@Valid @RequestBody FeedbackRequestDto requestDto) {
        FeedbackResponseDto response = feedbackService.createFeedback(requestDto);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/tags")
    public ResponseEntity<List<TagDto>> getAvailableTags() {
        return ResponseEntity.ok(feedbackService.getAllAvailableTags());
    }
}
