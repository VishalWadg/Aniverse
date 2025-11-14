package com.vvw.AniverseBackend.service;
import java.util.List;

import com.vvw.AniverseBackend.dto.RegisterUserRequestDto;
import com.vvw.AniverseBackend.dto.UserDto;
import com.vvw.AniverseBackend.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface UserService {
    Page<UserDto> getAllUsers(Pageable pageable);
    UserDto createNewUser(RegisterUserRequestDto registerUserRequestDto);

    // Service to Service methods
    User findByUsername(String username);

    UserDto getUserProfile(String username);
}
