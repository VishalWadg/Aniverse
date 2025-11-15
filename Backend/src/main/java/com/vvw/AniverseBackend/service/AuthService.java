package com.vvw.AniverseBackend.service;

import com.vvw.AniverseBackend.dto.CreateUserDto;
import com.vvw.AniverseBackend.dto.LoginRequestDto;
import com.vvw.AniverseBackend.dto.LoginResponseDto;
import com.vvw.AniverseBackend.dto.UserResponseDto;

public interface AuthService {
    UserResponseDto signup(CreateUserDto createUserDto);
    LoginResponseDto login(LoginRequestDto loginRequestDto);
}
