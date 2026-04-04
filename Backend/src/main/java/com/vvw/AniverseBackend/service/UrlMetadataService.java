package com.vvw.AniverseBackend.service;

import com.vvw.AniverseBackend.dto.UrlMetadataImage;
import com.vvw.AniverseBackend.dto.UrlMetadataMeta;
import com.vvw.AniverseBackend.dto.UrlMetadataResponse;
import org.springframework.stereotype.Service;
import org.springframework.web.util.HtmlUtils;

import java.io.IOException;
import java.net.InetAddress;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class UrlMetadataService {
    private static final Duration CONNECT_TIMEOUT = Duration.ofSeconds(3);
    private static final Duration REQUEST_TIMEOUT = Duration.ofSeconds(5);
    private static final Pattern META_TAG_PATTERN = Pattern.compile("(?is)<meta\\b[^>]*>");
    private static final Pattern ATTRIBUTE_PATTERN = Pattern.compile("(?i)([a-zA-Z_:][a-zA-Z0-9_:\\-]*)\\s*=\\s*(['\"])(.*?)\\2");
    private static final Pattern TITLE_PATTERN = Pattern.compile("(?is)<title[^>]*>(.*?)</title>");
    private static final Pattern TAG_PATTERN = Pattern.compile("(?is)<[^>]+>");

    private final HttpClient httpClient = HttpClient.newBuilder()
            .followRedirects(HttpClient.Redirect.NORMAL)
            .connectTimeout(CONNECT_TIMEOUT)
            .build();

    public UrlMetadataResponse fetch(String rawUrl) {
        URI uri = normalizeUri(rawUrl);

        if (uri == null || !isSafeExternalUri(uri)) {
            return failure(rawUrl);
        }

        HttpRequest request = HttpRequest.newBuilder(uri)
                .GET()
                .timeout(REQUEST_TIMEOUT)
                .header("Accept", "text/html,application/xhtml+xml")
                .header("User-Agent", "AniverseLinkPreviewBot/1.0")
                .build();

        try {
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() >= 400) {
                return failure(uri.toString());
            }

            URI responseUri = response.uri() != null ? response.uri() : uri;
            UrlMetadataMeta meta = extractMetadata(response.body(), responseUri);

            if (isBlank(meta.title()) && isBlank(meta.description()) && meta.image() == null) {
                meta = new UrlMetadataMeta(responseUri.getHost(), null, null, responseUri.getHost());
            }

            return new UrlMetadataResponse(1, responseUri.toString(), meta);
        } catch (IOException | InterruptedException ex) {
            if (ex instanceof InterruptedException) {
                Thread.currentThread().interrupt();
            }

            return failure(uri.toString());
        }
    }

    private UrlMetadataMeta extractMetadata(String html, URI baseUri) {
        String title = firstNonBlank(
                extractMetaContent(html, "og:title"),
                extractMetaContent(html, "twitter:title"),
                extractTitle(html),
                baseUri.getHost()
        );
        String description = firstNonBlank(
                extractMetaContent(html, "og:description"),
                extractMetaContent(html, "description"),
                extractMetaContent(html, "twitter:description")
        );
        String imageUrl = firstNonBlank(
                resolveUrl(baseUri, extractMetaContent(html, "og:image")),
                resolveUrl(baseUri, extractMetaContent(html, "twitter:image"))
        );
        String siteName = firstNonBlank(
                extractMetaContent(html, "og:site_name"),
                baseUri.getHost()
        );

        UrlMetadataImage image = isBlank(imageUrl) ? null : new UrlMetadataImage(imageUrl);

        return new UrlMetadataMeta(title, description, image, siteName);
    }

    private String extractTitle(String html) {
        Matcher matcher = TITLE_PATTERN.matcher(html);

        if (!matcher.find()) {
            return null;
        }

        return cleanValue(TAG_PATTERN.matcher(matcher.group(1)).replaceAll(" "));
    }

    private String extractMetaContent(String html, String key) {
        Matcher matcher = META_TAG_PATTERN.matcher(html);

        while (matcher.find()) {
            Map<String, String> attributes = extractAttributes(matcher.group());
            String attrValue = firstNonBlank(attributes.get("property"), attributes.get("name"));

            if (attrValue == null || !key.equalsIgnoreCase(attrValue)) {
                continue;
            }

            String content = cleanValue(attributes.get("content"));

            if (!isBlank(content)) {
                return content;
            }
        }

        return null;
    }

    private Map<String, String> extractAttributes(String tag) {
        Map<String, String> attributes = new LinkedHashMap<>();
        Matcher matcher = ATTRIBUTE_PATTERN.matcher(tag);

        while (matcher.find()) {
            attributes.put(matcher.group(1).toLowerCase(Locale.ROOT), matcher.group(3));
        }

        return attributes;
    }

    private URI normalizeUri(String rawUrl) {
        if (isBlank(rawUrl)) {
            return null;
        }

        String candidate = rawUrl.trim();

        if (!candidate.matches("^[a-zA-Z][a-zA-Z\\d+\\-.]*://.*$")) {
            candidate = "https://" + candidate;
        }

        try {
            URI uri = new URI(candidate).normalize();

            if (uri.getScheme() == null || uri.getHost() == null) {
                return null;
            }

            return uri;
        } catch (URISyntaxException ex) {
            return null;
        }
    }

    private boolean isSafeExternalUri(URI uri) {
        String scheme = Optional.ofNullable(uri.getScheme()).orElse("").toLowerCase(Locale.ROOT);

        if (!scheme.equals("http") && !scheme.equals("https")) {
            return false;
        }

        if (uri.getUserInfo() != null || isBlank(uri.getHost())) {
            return false;
        }

        String host = uri.getHost().toLowerCase(Locale.ROOT);

        if (host.equals("localhost") || host.endsWith(".local")) {
            return false;
        }

        try {
            for (InetAddress address : InetAddress.getAllByName(uri.getHost())) {
                if (address.isAnyLocalAddress()
                        || address.isLoopbackAddress()
                        || address.isLinkLocalAddress()
                        || address.isSiteLocalAddress()
                        || address.isMulticastAddress()) {
                    return false;
                }
            }
        } catch (IOException ex) {
            return false;
        }

        return true;
    }

    private String resolveUrl(URI baseUri, String candidate) {
        if (isBlank(candidate)) {
            return null;
        }

        try {
            return baseUri.resolve(candidate).toString();
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }

    private String cleanValue(String value) {
        if (isBlank(value)) {
            return null;
        }

        return HtmlUtils.htmlUnescape(value)
                .replace('\u00A0', ' ')
                .replaceAll("\\s+", " ")
                .trim();
    }

    private String firstNonBlank(String... values) {
        for (String value : values) {
            if (!isBlank(value)) {
                return value;
            }
        }

        return null;
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private UrlMetadataResponse failure(String link) {
        return new UrlMetadataResponse(0, link, null);
    }
}
