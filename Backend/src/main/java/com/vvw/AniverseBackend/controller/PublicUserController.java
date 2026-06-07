package com.vvw.AniverseBackend.controller;

import com.vvw.AniverseBackend.dto.PublicUserProfileDto;
import com.vvw.AniverseBackend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/public/users")
public class PublicUserController {
    private final UserService userService;

    @GetMapping("/profile/{username}")
    public ResponseEntity<PublicUserProfileDto> getUserProfile(@PathVariable String username) {
        return ResponseEntity.ok(userService.getUserProfile(username));
    }
}
