package com.vvw.AniverseBackend.controller;

import com.vvw.AniverseBackend.dto.UserDto;
import com.vvw.AniverseBackend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/users") // Standard prefix for the user resource
public class UserController {

    private final UserService userService;

    /**
     * Gets a single user's public profile.
     * This is public.
     */
    @GetMapping("/{username}")
    public ResponseEntity<UserDto> getUserProfile(@PathVariable String username) {
        UserDto userDto = userService.getUserProfile(username);
        return ResponseEntity.ok(userDto);
    }

    /**
     * Gets a paginated list of all users.
     * This should be for ADMINS ONLY.
     * Your original `getAllUsers` logic belongs here.
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<UserDto>> getAllUsers(Pageable pageable) {
        Page<UserDto> users = userService.getAllUsers(pageable);
        return ResponseEntity.ok(users);
    }
}