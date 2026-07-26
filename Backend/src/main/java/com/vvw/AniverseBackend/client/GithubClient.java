package com.vvw.AniverseBackend.client;

import com.vvw.AniverseBackend.config.properties.GithubProperties;
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
}
