package com.vvw.AniverseBackend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.http.ResponseEntity;
import jakarta.validation.Valid;
import java.util.List;

import com.vvw.AniverseBackend.dto.TagDto;
import com.vvw.AniverseBackend.dto.TagSuggestionRequest;
import com.vvw.AniverseBackend.service.FeedbackService;
import com.vvw.AniverseBackend.service.TagService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/tags")
@RequiredArgsConstructor
public class TagsController {
    private final TagService tagService;

    @GetMapping
    public ResponseEntity<List<TagDto>> getAvailableTags() {
        return ResponseEntity.ok(tagService.getAllAvailableTags());
    }

    @PostMapping("/suggest")
    public ResponseEntity<List<TagDto>> getSuggestedTags(@Valid @RequestBody TagSuggestionRequest request) {
        return ResponseEntity.ok(tagService.getSuggestedTags(request.getQuery()));
    }
}
