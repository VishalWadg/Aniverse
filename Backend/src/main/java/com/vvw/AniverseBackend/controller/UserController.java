package com.vvw.AniverseBackend.controller;


import com.vvw.AniverseBackend.dto.CurrentUserProfileDto;
import com.vvw.AniverseBackend.dto.UpdateUserProfileDto;
import com.vvw.AniverseBackend.entity.User;
import com.vvw.AniverseBackend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<CurrentUserProfileDto> getCurrentUserProfile(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(userService.getCurrentUserProfile(currentUser.getUsername()));
    }

    @PatchMapping("/me")
    public ResponseEntity<CurrentUserProfileDto> updateCurrentUserProfile(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody UpdateUserProfileDto updateUserProfileDto) {
        return ResponseEntity.ok(
                userService.updateCurrentUserProfile(currentUser.getUsername(), updateUserProfileDto));
    }
}
