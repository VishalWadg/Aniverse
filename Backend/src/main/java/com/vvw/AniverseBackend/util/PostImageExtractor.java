package com.vvw.AniverseBackend.util;

import org.jsoup.Jsoup;
import java.util.Collections;
import java.util.Set;
import java.util.stream.Collectors;

public final class PostImageExtractor {

    private PostImageExtractor() {
        // Prevent instantiation of utility class
    }

    public static Set<String> extractPublicIds(String htmlContent) {
        if (htmlContent == null || htmlContent.isBlank()) {
            return Collections.emptySet();
        }

        return Jsoup.parse(htmlContent)
                .select("img[data-public-id]")
                .stream()
                .map(element -> element.attr("data-public-id"))
                .filter(id -> id != null && !id.isBlank())
                .collect(Collectors.toSet());
    }
}