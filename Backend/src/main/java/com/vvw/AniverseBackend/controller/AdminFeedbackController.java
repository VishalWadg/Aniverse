package com.vvw.AniverseBackend.controller;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.vvw.AniverseBackend.dto.ApproveGroupRequestDto;
import com.vvw.AniverseBackend.dto.FeedbackGroupResponseDto;
import com.vvw.AniverseBackend.dto.MoveFeedbackRequestDto;
import com.vvw.AniverseBackend.entity.type.FeedbackGroupStatus;
import com.vvw.AniverseBackend.service.AdminFeedbackService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/admin/feedback-groups")
@RequiredArgsConstructor
public class AdminFeedbackController {
    private final AdminFeedbackService adminFeedbackService;

    @GetMapping
    public ResponseEntity<Page<FeedbackGroupResponseDto>> getGroups(
            @RequestParam(defaultValue = "PENDING") FeedbackGroupStatus status,
            @PageableDefault(size = 10) Pageable pageable) {

        Page<FeedbackGroupResponseDto> response = adminFeedbackService.getGroups(status, pageable);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<FeedbackGroupResponseDto> approveGroup(
            @PathVariable UUID id,
            @Valid @RequestBody ApproveGroupRequestDto dto) {

        return ResponseEntity.ok(adminFeedbackService.approveGroup(id, dto));
    }

    @PostMapping("/{id}/discard")
    public ResponseEntity<FeedbackGroupResponseDto> discardGroup(@PathVariable UUID id) {
        return ResponseEntity.ok(adminFeedbackService.discardGroup(id));
    }

    @PostMapping("/{id}/restore")
    public ResponseEntity<FeedbackGroupResponseDto> restoreGroup(@PathVariable UUID id) {
        return ResponseEntity.ok(adminFeedbackService.restoreGroup(id));
    }

    @PostMapping("/items/{feedbackId}/move")
    public ResponseEntity<Void> moveFeedback(
            @PathVariable UUID feedbackId,
            @Valid @RequestBody MoveFeedbackRequestDto dto) {
                
        adminFeedbackService.moveFeedback(feedbackId, dto);
        return ResponseEntity.noContent().build();
    }

}
