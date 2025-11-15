package com.vvw.AniverseBackend.service;

import com.vvw.AniverseBackend.dto.UserResponseDto;
import com.vvw.AniverseBackend.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.userdetails.UserDetailsService;

public interface UserService extends UserDetailsService {
    Page<UserResponseDto> getAllUsers(Pageable pageable);
    // Service to Service methods
    User findByUsername(String username);

    UserResponseDto getUserProfile(String username);
}
