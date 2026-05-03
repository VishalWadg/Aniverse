package com.vvw.AniverseBackend.controller;


import com.vvw.AniverseBackend.dto.CurrentUserProfileDto;
import com.vvw.AniverseBackend.dto.PublicUserProfileDto;
import com.vvw.AniverseBackend.dto.UpdateUserProfileDto;
import com.vvw.AniverseBackend.dto.UserResponseDto;
import com.vvw.AniverseBackend.entity.User;
import com.vvw.AniverseBackend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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

    @GetMapping("/profile/{username}")
    public ResponseEntity<PublicUserProfileDto> getUserProfile(@PathVariable String username) {
        return ResponseEntity.ok(userService.getUserProfile(username));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<UserResponseDto>> getAllUsers(Pageable pageable) {
        return ResponseEntity.ok(userService.getAllUsers(pageable));
    }
}
