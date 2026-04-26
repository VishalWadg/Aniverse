// package com.vvw.AniverseBackend.controller;

// import com.vvw.AniverseBackend.dto.UrlMetadataResponse;
// import com.vvw.AniverseBackend.service.UrlMetadataService;
// import lombok.RequiredArgsConstructor;
// import org.springframework.http.ResponseEntity;
// import org.springframework.web.bind.annotation.GetMapping;
// import org.springframework.web.bind.annotation.RequestMapping;
// import org.springframework.web.bind.annotation.RequestParam;
// import org.springframework.web.bind.annotation.RestController;

// @RestController
// @RequiredArgsConstructor
// @RequestMapping("/url-meta")
// public class UrlMetadataController {
//     private final UrlMetadataService urlMetadataService;

//     @GetMapping
//     public ResponseEntity<UrlMetadataResponse> fetchMetadata(@RequestParam("url") String url) {
//         return ResponseEntity.ok(urlMetadataService.fetch(url));
//     }
// }
