package com.vvw.AniverseBackend.handler;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.vvw.AniverseBackend.entity.FeedbackGroup;
import com.vvw.AniverseBackend.entity.type.FeedbackGroupStatus;
import com.vvw.AniverseBackend.repository.FeedbackGroupRepository;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
@RequiredArgsConstructor
public class GithubIssueEventHandler {
    private final FeedbackGroupRepository feedbackGroupRepository;
    private final ObjectMapper objectMapper;

    public void handle(String rawPayload) {
        try {
            JsonNode root = objectMapper.readTree(rawPayload);
            String action = root.path("action").asText();
            JsonNode issueNode = root.path("issue");
            Integer issueNumber = issueNode.path("number").asInt();
            switch (action) {
                
                case "closed" -> feedbackGroupRepository.findByGithubIssueNumber(issueNumber)
                        .ifPresentOrElse(
                                group -> {
                                    group.setStatus(FeedbackGroupStatus.RESOLVED);
                                    feedbackGroupRepository.save(group);
                                    log.info("Marked FeedbackGroup {} as RESOLVED via GitHub Issue #{}",
                                            group.getId(), issueNumber);
                                },
                                () -> log.info("No FeedbackGroup linked to closed GitHub Issue #{}", issueNumber));

                case "reopened" -> feedbackGroupRepository.findByGithubIssueNumber(issueNumber)
                        .ifPresentOrElse(
                                group -> {
                                    group.setStatus(FeedbackGroupStatus.APPROVED);
                                    feedbackGroupRepository.save(group);
                                    log.info("Restored FeedbackGroup {} to APPROVED via GitHub Issue #{}",
                                            group.getId(), issueNumber);
                                },
                                () -> log.info("No FeedbackGroup linked to reopened GitHub Issue #{}", issueNumber));
                default -> log.info("Unhandled issue action [{}] for Issue #{}", action, issueNumber);
            }
        } catch (Exception e) {
            log.error("Error processing issue webhook payload: {}", e.getMessage(), e);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid issue event payload");
        }
    }

}
