package com.vvw.AniverseBackend.service;

import com.vvw.AniverseBackend.dto.CreateUserDto;
import com.vvw.AniverseBackend.dto.LoginRequestDto;
import com.vvw.AniverseBackend.dto.AuthenticationResponseDto;
import com.vvw.AniverseBackend.dto.UserResponseDto;

public interface AuthService {
    UserResponseDto signup(CreateUserDto createUserDto);
    AuthenticationResponseDto login(LoginRequestDto loginRequestDto);
    AuthenticationResponseDto refreshToken(String oldRefToken);

    void logout(String token);
}
