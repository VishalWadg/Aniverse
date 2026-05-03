package com.vvw.AniverseBackend.service;

import com.vvw.AniverseBackend.dto.CurrentUserProfileDto;
import com.vvw.AniverseBackend.dto.PublicUserProfileDto;
import com.vvw.AniverseBackend.dto.UpdateUserProfileDto;
import com.vvw.AniverseBackend.dto.UserResponseDto;
import com.vvw.AniverseBackend.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.userdetails.UserDetailsService;

public interface UserService extends UserDetailsService {
    Page<UserResponseDto> getAllUsers(Pageable pageable);

    PublicUserProfileDto getUserProfile(String username);
    CurrentUserProfileDto getCurrentUserProfile(String username);
    CurrentUserProfileDto updateCurrentUserProfile(String username, UpdateUserProfileDto updateUserProfileDto);

    // Service to Service methods
    User findByUsername(String username);
}
