package com.vvw.AniverseBackend.client;

import com.vvw.AniverseBackend.config.properties.GithubProperties;
import com.vvw.AniverseBackend.dto.internal.GithubCreateIssueRequestDto;
import com.vvw.AniverseBackend.dto.internal.GithubIssueResponseDto;
import com.vvw.AniverseBackend.dto.internal.GithubLabelDto;
import lombok.RequiredArgsConstructor;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.List;

@Component
@RequiredArgsConstructor
public class GithubClient {
    private final RestClient githubRestClient;
    private final GithubProperties githubProperties;

    public List<GithubLabelDto> getLabels() {
        return githubRestClient.get()
                .uri("/repos/" + githubProperties.repo() + "/labels")
                .retrieve()
                .body(new ParameterizedTypeReference<List<GithubLabelDto>>() {});
    }

    public GithubIssueResponseDto createIssue(String title, String body, List<String> labels) {
        GithubCreateIssueRequestDto requestBody = new GithubCreateIssueRequestDto(title, body, labels);
    return githubRestClient.post()
            .uri("/repos/" + githubProperties.repo() + "/issues")
            .body(requestBody)
            .retrieve()
            .body(GithubIssueResponseDto.class);
    }
}
