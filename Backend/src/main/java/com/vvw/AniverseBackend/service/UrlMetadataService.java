package com.vvw.AniverseBackend.service;

import com.vvw.AniverseBackend.dto.UrlMetadataImage;
import com.vvw.AniverseBackend.dto.UrlMetadataMeta;
import com.vvw.AniverseBackend.dto.UrlMetadataResponse;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.springframework.stereotype.Service;

import javax.net.ssl.SNIHostName;
import javax.net.ssl.SSLParameters;
import javax.net.ssl.SSLSocket;
import javax.net.ssl.SSLSocketFactory;
import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.EOFException;
import java.io.IOException;
import java.net.InetAddress;
import java.net.InetSocketAddress;
import java.net.Socket;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.UnknownHostException;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

@Service
public class UrlMetadataService {
    private static final Duration CONNECT_TIMEOUT = Duration.ofSeconds(3);
    private static final Duration READ_TIMEOUT = Duration.ofSeconds(5);
    private static final int MAX_REDIRECTS = 5;
    private static final int MAX_HEADER_BYTES = 16 * 1024;
    private static final int MAX_RESPONSE_BYTES = 1024 * 1024;
    private static final String USER_AGENT = "AniverseLinkPreviewBot/1.0";
    private static final Set<String> HTML_CONTENT_TYPES = Set.of("text/html", "application/xhtml+xml");
    private static final Set<Integer> REDIRECT_STATUS_CODES = Set.of(301, 302, 303, 307, 308);

    public UrlMetadataResponse fetch(String rawUrl) {
        URI uri = normalizeUri(rawUrl);

        if (uri == null) {
            return failure(rawUrl);
        }

        try {
            PageResponse response = fetchPage(uri);

            if (response == null) {
                return failure(uri.toString());
            }

            UrlMetadataMeta meta = extractMetadata(response);

            if (isBlank(meta.title()) && isBlank(meta.description()) && meta.image() == null) {
                meta = new UrlMetadataMeta(response.uri().getHost(), null, null, response.uri().getHost());
            }

            return new UrlMetadataResponse(1, response.uri().toString(), meta);
        } catch (IOException ex) {
            return failure(uri.toString());
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            return failure(uri.toString());
        }
    }

    private PageResponse fetchPage(URI startUri) throws IOException, InterruptedException {
        URI currentUri = startUri;

        for (int redirectCount = 0; redirectCount <= MAX_REDIRECTS; redirectCount++) {
            PageResponse response = fetchPageOnce(currentUri);

            if (response == null) {
                return null;
            }

            if (!REDIRECT_STATUS_CODES.contains(response.statusCode())) {
                if (response.statusCode() >= 200 && response.statusCode() < 300) {
                    return response;
                }

                return null;
            }

            String location = response.headers().get("location");

            if (isBlank(location)) {
                return null;
            }

            URI nextUri = resolveRedirectUri(currentUri, location);

            if (nextUri == null) {
                return null;
            }

            currentUri = nextUri;
        }

        return null;
    }

    private PageResponse fetchPageOnce(URI uri) throws IOException {
        List<ResolvedTarget> targets = resolveTargets(uri);
        IOException lastException = null;

        for (ResolvedTarget target : targets) {
            try {
                return executeRequest(target);
            } catch (IOException ex) {
                lastException = ex;
            }
        }

        if (lastException != null) {
            throw lastException;
        }

        return null;
    }

    private PageResponse executeRequest(ResolvedTarget target) throws IOException {
        try (
                Socket socket = openSocket(target);
                BufferedInputStream input = new BufferedInputStream(socket.getInputStream());
                BufferedOutputStream output = new BufferedOutputStream(socket.getOutputStream())
        ) {
            writeRequest(output, target.uri());
            ResponseHead responseHead = readResponseHead(input);

            if (REDIRECT_STATUS_CODES.contains(responseHead.statusCode())) {
                return new PageResponse(target.uri(), responseHead.statusCode(), responseHead.headers(), new byte[0]);
            }

            if (!isHtmlContentType(responseHead.headers().get("content-type"))) {
                throw new IOException("Unsupported content type");
            }

            byte[] body = readResponseBody(input, responseHead.headers());

            return new PageResponse(target.uri(), responseHead.statusCode(), responseHead.headers(), body);
        }
    }

    private Socket openSocket(ResolvedTarget target) throws IOException {
        Socket baseSocket = new Socket();
        baseSocket.connect(new InetSocketAddress(target.address(), target.port()), (int) CONNECT_TIMEOUT.toMillis());
        baseSocket.setSoTimeout((int) READ_TIMEOUT.toMillis());

        if (!"https".equalsIgnoreCase(target.uri().getScheme())) {
            return baseSocket;
        }

        SSLSocket sslSocket = (SSLSocket) SSLSocketFactory.getDefault()
                .createSocket(baseSocket, target.uri().getHost(), target.port(), true);
        SSLParameters parameters = sslSocket.getSSLParameters();
        parameters.setEndpointIdentificationAlgorithm("HTTPS");
        parameters.setServerNames(List.of(new SNIHostName(target.uri().getHost())));
        sslSocket.setSSLParameters(parameters);
        sslSocket.setSoTimeout((int) READ_TIMEOUT.toMillis());
        sslSocket.startHandshake();

        return sslSocket;
    }

    private void writeRequest(BufferedOutputStream output, URI uri) throws IOException {
        String path = uri.getRawPath();

        if (isBlank(path)) {
            path = "/";
        }

        if (!isBlank(uri.getRawQuery())) {
            path = path + "?" + uri.getRawQuery();
        }

        String request = "GET " + path + " HTTP/1.1\r\n"
                + "Host: " + formatHostHeader(uri) + "\r\n"
                + "User-Agent: " + USER_AGENT + "\r\n"
                + "Accept: text/html,application/xhtml+xml\r\n"
                + "Accept-Encoding: identity\r\n"
                + "Connection: close\r\n"
                + "\r\n";

        output.write(request.getBytes(StandardCharsets.ISO_8859_1));
        output.flush();
    }

    private ResponseHead readResponseHead(BufferedInputStream input) throws IOException {
        ByteArrayOutputStream headerBytes = new ByteArrayOutputStream();
        int matchState = 0;

        while (headerBytes.size() < MAX_HEADER_BYTES) {
            int nextByte = input.read();

            if (nextByte == -1) {
                throw new EOFException("Unexpected end of stream while reading headers");
            }

            headerBytes.write(nextByte);

            if (matchState == 0 && nextByte == '\r') {
                matchState = 1;
            } else if (matchState == 1 && nextByte == '\n') {
                matchState = 2;
            } else if (matchState == 2 && nextByte == '\r') {
                matchState = 3;
            } else if (matchState == 3 && nextByte == '\n') {
                matchState = 4;
                break;
            } else {
                matchState = nextByte == '\r' ? 1 : 0;
            }
        }

        if (matchState != 4) {
            throw new IOException("Response headers exceeded the allowed size");
        }

        String headersText = headerBytes.toString(StandardCharsets.ISO_8859_1);
        String[] lines = headersText.substring(0, headersText.length() - 4).split("\r\n");

        if (lines.length == 0) {
            throw new IOException("Missing HTTP status line");
        }

        String[] statusLineParts = lines[0].split(" ", 3);

        if (statusLineParts.length < 2) {
            throw new IOException("Invalid HTTP status line");
        }

        int statusCode;

        try {
            statusCode = Integer.parseInt(statusLineParts[1]);
        } catch (NumberFormatException ex) {
            throw new IOException("Invalid HTTP status code", ex);
        }

        Map<String, String> headers = new LinkedHashMap<>();

        for (int i = 1; i < lines.length; i++) {
            int separatorIndex = lines[i].indexOf(':');

            if (separatorIndex <= 0) {
                continue;
            }

            headers.put(
                    lines[i].substring(0, separatorIndex).trim().toLowerCase(Locale.ROOT),
                    lines[i].substring(separatorIndex + 1).trim()
            );
        }

        return new ResponseHead(statusCode, headers);
    }

    private byte[] readResponseBody(BufferedInputStream input, Map<String, String> headers) throws IOException {
        String transferEncoding = headers.getOrDefault("transfer-encoding", "");

        if (transferEncoding.toLowerCase(Locale.ROOT).contains("chunked")) {
            return readChunkedBody(input);
        }

        long contentLength = parseLong(headers.get("content-length"));

        if (contentLength > MAX_RESPONSE_BYTES) {
            throw new IOException("Response body exceeded the allowed size");
        }

        if (contentLength >= 0) {
            return readFixedLengthBody(input, contentLength);
        }

        return readUntilEof(input);
    }

    private byte[] readChunkedBody(BufferedInputStream input) throws IOException {
        ByteArrayOutputStream body = new ByteArrayOutputStream();

        while (true) {
            String chunkSizeLine = readAsciiLine(input);
            String normalizedChunkSize = chunkSizeLine.split(";", 2)[0].trim();
            int chunkSize;

            try {
                chunkSize = Integer.parseInt(normalizedChunkSize, 16);
            } catch (NumberFormatException ex) {
                throw new IOException("Invalid chunk size", ex);
            }

            if (chunkSize == 0) {
                while (!readAsciiLine(input).isEmpty()) {
                    // discard trailer headers
                }
                break;
            }

            if (body.size() + chunkSize > MAX_RESPONSE_BYTES) {
                throw new IOException("Response body exceeded the allowed size");
            }

            body.write(readExactBytes(input, chunkSize));
            consumeCrlf(input);
        }

        return body.toByteArray();
    }

    private byte[] readFixedLengthBody(BufferedInputStream input, long contentLength) throws IOException {
        if (contentLength == 0) {
            return new byte[0];
        }

        if (contentLength > Integer.MAX_VALUE) {
            throw new IOException("Response body is too large");
        }

        return readExactBytes(input, (int) contentLength);
    }

    private byte[] readUntilEof(BufferedInputStream input) throws IOException {
        ByteArrayOutputStream body = new ByteArrayOutputStream();
        byte[] buffer = new byte[8192];
        int read;

        while ((read = input.read(buffer)) != -1) {
            if (body.size() + read > MAX_RESPONSE_BYTES) {
                throw new IOException("Response body exceeded the allowed size");
            }

            body.write(buffer, 0, read);
        }

        return body.toByteArray();
    }

    private byte[] readExactBytes(BufferedInputStream input, int length) throws IOException {
        byte[] buffer = input.readNBytes(length);

        if (buffer.length != length) {
            throw new EOFException("Unexpected end of stream while reading response body");
        }

        return buffer;
    }

    private void consumeCrlf(BufferedInputStream input) throws IOException {
        int carriageReturn = input.read();
        int lineFeed = input.read();

        if (carriageReturn != '\r' || lineFeed != '\n') {
            throw new IOException("Invalid chunk delimiter");
        }
    }

    private String readAsciiLine(BufferedInputStream input) throws IOException {
        ByteArrayOutputStream buffer = new ByteArrayOutputStream();
        int previous = -1;

        while (buffer.size() < MAX_HEADER_BYTES) {
            int nextByte = input.read();

            if (nextByte == -1) {
                throw new EOFException("Unexpected end of stream while reading line");
            }

            buffer.write(nextByte);

            if (previous == '\r' && nextByte == '\n') {
                byte[] lineBytes = buffer.toByteArray();
                return new String(lineBytes, 0, lineBytes.length - 2, StandardCharsets.US_ASCII);
            }

            previous = nextByte;
        }

        throw new IOException("Response line exceeded the allowed size");
    }

    private UrlMetadataMeta extractMetadata(PageResponse response) throws IOException {
        Document document = Jsoup.parse(
                new ByteArrayInputStream(response.body()),
                resolveCharset(response.headers().get("content-type")).name(),
                response.uri().toString()
        );
        URI baseUri = response.uri();
        String title = firstNonBlank(
                extractMetaContent(document, "property", "og:title"),
                extractMetaContent(document, "name", "twitter:title"),
                cleanValue(document.title()),
                baseUri.getHost()
        );
        String description = firstNonBlank(
                extractMetaContent(document, "property", "og:description"),
                extractMetaContent(document, "name", "description"),
                extractMetaContent(document, "name", "twitter:description")
        );
        String imageUrl = firstNonBlank(
                resolveUrl(baseUri, extractMetaContent(document, "property", "og:image")),
                resolveUrl(baseUri, extractMetaContent(document, "name", "twitter:image"))
        );
        String siteName = firstNonBlank(
                extractMetaContent(document, "property", "og:site_name"),
                baseUri.getHost()
        );

        UrlMetadataImage image = isBlank(imageUrl) ? null : new UrlMetadataImage(imageUrl);

        return new UrlMetadataMeta(title, description, image, siteName);
    }

    private String extractMetaContent(Document document, String attributeName, String attributeValue) {
        for (Element metaTag : document.select("meta")) {
            if (attributeValue.equalsIgnoreCase(metaTag.attr(attributeName))) {
                String content = cleanValue(metaTag.attr("content"));

                if (!isBlank(content)) {
                    return content;
                }
            }
        }

        return null;
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

            String scheme = uri.getScheme().toLowerCase(Locale.ROOT);

            if (!scheme.equals("http") && !scheme.equals("https")) {
                return null;
            }

            return new URI(
                    scheme,
                    null,
                    uri.getHost(),
                    uri.getPort(),
                    uri.getRawPath(),
                    uri.getRawQuery(),
                    null
            ).normalize();
        } catch (URISyntaxException ex) {
            return null;
        }
    }

    private List<ResolvedTarget> resolveTargets(URI uri) throws UnknownHostException {
        if (uri.getUserInfo() != null || isBlank(uri.getHost())) {
            throw new UnknownHostException("Unsupported host");
        }

        String host = uri.getHost().toLowerCase(Locale.ROOT);

        if (host.equals("localhost") || host.endsWith(".local")) {
            throw new UnknownHostException("Unsupported host");
        }

        InetAddress[] resolvedAddresses = InetAddress.getAllByName(uri.getHost());
        Set<ResolvedTarget> safeTargets = new LinkedHashSet<>();
        int port = resolvePort(uri);

        for (InetAddress address : resolvedAddresses) {
            if (!isSafeResolvedAddress(address)) {
                throw new UnknownHostException("Resolved address is not allowed");
            }

            safeTargets.add(new ResolvedTarget(uri, address, port));
        }

        return List.copyOf(safeTargets);
    }

    private boolean isSafeResolvedAddress(InetAddress address) {
        if (address.isAnyLocalAddress()
                || address.isLoopbackAddress()
                || address.isLinkLocalAddress()
                || address.isSiteLocalAddress()
                || address.isMulticastAddress()) {
            return false;
        }

        byte[] bytes = address.getAddress();

        if (bytes.length == 4) {
            int first = Byte.toUnsignedInt(bytes[0]);
            int second = Byte.toUnsignedInt(bytes[1]);

            if (first == 0
                    || (first == 100 && second >= 64 && second <= 127)
                    || (first == 192 && second == 0)
                    || (first == 198 && (second == 18 || second == 19))) {
                return false;
            }
        } else if (bytes.length == 16) {
            int first = Byte.toUnsignedInt(bytes[0]);

            if ((first & 0xfe) == 0xfc) {
                return false;
            }
        }

        return true;
    }

    private URI resolveRedirectUri(URI baseUri, String location) {
        try {
            return normalizeUri(baseUri.resolve(location).toString());
        } catch (IllegalArgumentException ex) {
            return null;
        }
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

    private Charset resolveCharset(String contentType) {
        if (isBlank(contentType)) {
            return StandardCharsets.UTF_8;
        }

        for (String part : contentType.split(";")) {
            String trimmedPart = part.trim();

            if (!trimmedPart.toLowerCase(Locale.ROOT).startsWith("charset=")) {
                continue;
            }

            String charsetName = trimmedPart.substring("charset=".length()).trim().replace("\"", "");

            try {
                return Charset.forName(charsetName);
            } catch (Exception ignored) {
                return StandardCharsets.UTF_8;
            }
        }

        return StandardCharsets.UTF_8;
    }

    private boolean isHtmlContentType(String contentType) {
        if (isBlank(contentType)) {
            return false;
        }

        String normalizedContentType = contentType.split(";", 2)[0].trim().toLowerCase(Locale.ROOT);
        return HTML_CONTENT_TYPES.contains(normalizedContentType);
    }

    private String formatHostHeader(URI uri) {
        String host = uri.getHost();
        int port = resolvePort(uri);
        boolean defaultPort = ("http".equalsIgnoreCase(uri.getScheme()) && port == 80)
                || ("https".equalsIgnoreCase(uri.getScheme()) && port == 443);
        String normalizedHost = host != null && host.contains(":") ? "[" + host + "]" : host;

        return defaultPort ? normalizedHost : normalizedHost + ":" + port;
    }

    private int resolvePort(URI uri) {
        if (uri.getPort() > 0) {
            return uri.getPort();
        }

        return "https".equalsIgnoreCase(uri.getScheme()) ? 443 : 80;
    }

    private long parseLong(String value) {
        if (isBlank(value)) {
            return -1;
        }

        try {
            return Long.parseLong(value.trim());
        } catch (NumberFormatException ex) {
            return -1;
        }
    }

    private String cleanValue(String value) {
        if (isBlank(value)) {
            return null;
        }

        return value.replace('\u00A0', ' ')
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

    private record ResolvedTarget(URI uri, InetAddress address, int port) {
    }

    private record ResponseHead(int statusCode, Map<String, String> headers) {
    }

    private record PageResponse(URI uri, int statusCode, Map<String, String> headers, byte[] body) {
    }
}
