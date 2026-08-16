package com.vvw.AniverseBackend.controller;

import com.vvw.AniverseBackend.handler.GithubIssueEventHandler;
import com.vvw.AniverseBackend.handler.GithubLabelEventHandler;
import com.vvw.AniverseBackend.security.GithubSignatureVerifier;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/webhooks/github")
@RequiredArgsConstructor
@Slf4j
public class GithubWebhookController {
    private final GithubSignatureVerifier githubSignatureVerifier;
    private final GithubLabelEventHandler githubLabelEventHandler;
    private final GithubIssueEventHandler githubIssueEventHandler;

    @PostMapping
    public ResponseEntity<String> handleGithubWebhook(
            @RequestHeader(value = "X-Hub-Signature-256", required = false) String signature,
            @RequestHeader(value = "X-GitHub-Event", defaultValue = "unknown") String eventType,
            @RequestBody String rawPayload) {

        log.info("Received Github Webhook Event : [{}]", eventType);
        githubSignatureVerifier.verify(rawPayload, signature);

        switch (eventType) {
            case "label" -> githubLabelEventHandler.handle(rawPayload);
            case "issues" -> githubIssueEventHandler.handle(rawPayload);
            default -> log.info("Event type [{}] ignored.", eventType);
        }

        return ResponseEntity.ok("Webhook processed successfully");
    }
}
