package com.vvw.AniverseBackend.service.impl;

import com.vvw.AniverseBackend.dto.CreateUserDto;
import com.vvw.AniverseBackend.dto.LoginRequestDto;
import com.vvw.AniverseBackend.dto.AuthenticationResponseDto;
import com.vvw.AniverseBackend.dto.UserResponseDto;
import com.vvw.AniverseBackend.dto.internal.TokenRotationResponse;
import com.vvw.AniverseBackend.entity.RefreshToken;
import com.vvw.AniverseBackend.entity.User;
import com.vvw.AniverseBackend.repository.UserRepository;
import com.vvw.AniverseBackend.security.JwtUtil;
import com.vvw.AniverseBackend.service.AuthService;
import com.vvw.AniverseBackend.service.RefreshTokenService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {
    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final ModelMapper modelMapper;
    private final RefreshTokenService refreshTokenService;
    private final JwtUtil jwtUtil;

    @Override
    @Transactional
    public UserResponseDto signup(CreateUserDto createUserDto) {
        // 1. Check if user exists (This is correct)
        if(userRepository.existsByUsername(createUserDto.getUsername())){
            // (Pro-tip: Throw a custom exception here, like UserAlreadyExistsException)
            throw new IllegalArgumentException("The user already exists");
        }

        User user = modelMapper.map(createUserDto, User.class);

        user.setPassword(passwordEncoder.encode(createUserDto.getPassword()));

        User savedUser = userRepository.save(user);

        return modelMapper.map(savedUser, UserResponseDto.class);
    }

    @Override
    public AuthenticationResponseDto login(LoginRequestDto loginRequestDto){
        Authentication authentication  = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequestDto.getUsername(), loginRequestDto.getPassword()));
        User user = (User) authentication.getPrincipal();
        String token = jwtUtil.generateAccessToken(user);
        UserResponseDto userResponseDto = modelMapper.map(user, UserResponseDto.class);
        String refToken = refreshTokenService.createRefreshToken(user.getId());

        return AuthenticationResponseDto.builder()
                .expiresIn(jwtUtil.getExpirationInSeconds())
                .token(token)
                .refToken(refToken)
                .user(userResponseDto)
                .build();
    }

    @Override
    public AuthenticationResponseDto refreshToken(String oldRefToken) {
        TokenRotationResponse response = refreshTokenService.rotateRefreshToken(oldRefToken);
        User user = response.user();
        String newRawToken = response.rawToken();
        String newAccessToken = jwtUtil.generateAccessToken(user);
        UserResponseDto userResponseDto = modelMapper.map(user, UserResponseDto.class);

        return AuthenticationResponseDto.builder()
                .token(newAccessToken)
                .refToken(newRawToken)
                .user(userResponseDto)
                .expiresIn(jwtUtil.getExpirationInSeconds())
                .build();
    }

    @Override
    public void logout(String token) {
        refreshTokenService.deleteByToken(token);
    }
}
