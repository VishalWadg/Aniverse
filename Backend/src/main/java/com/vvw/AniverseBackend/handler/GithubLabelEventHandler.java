package com.vvw.AniverseBackend.handler;

import java.util.Set;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.vvw.AniverseBackend.service.TagCommandService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class GithubLabelEventHandler {
    private final TagCommandService tagCommandService;
    private final ObjectMapper objectMapper;

    public void handle(String rawPayload){
        try {
            JsonNode root = objectMapper.readTree(rawPayload);
            String action = root.path("action").asText();
            JsonNode labelNode = root.path("label");
            Long labelId = labelNode.path("id").asLong();
            String name = labelNode.path("name").asText();
            String description =   labelNode.path("description").asText();

            switch (action) {
                case "created", "edited" -> tagCommandService.upsertSingleTag(labelId, name, description);
                case "deleted" -> tagCommandService.deleteTagsByGithubIds(Set.of(labelId));
                default -> log.info("Unhandled label action: [{}]", action);
            }

            log.info("🏷️ Processing Label Event: Action [{}], Name [{}]", action, name);
        }catch (Exception e) {
            log.error("❌ Error processing label webhook payload: {}", e.getMessage(), e);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid label event payload");
        }
    }
}
