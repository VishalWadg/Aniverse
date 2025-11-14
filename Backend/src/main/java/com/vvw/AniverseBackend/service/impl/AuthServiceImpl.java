package com.vvw.AniverseBackend.service.impl;

import com.vvw.AniverseBackend.dto.CreateUserDto;
import com.vvw.AniverseBackend.dto.LoginRequestDto;
import com.vvw.AniverseBackend.dto.LoginResponseDto;
import com.vvw.AniverseBackend.dto.UserResponseDto;
import com.vvw.AniverseBackend.entity.User;
import com.vvw.AniverseBackend.repository.UserRepository;
import com.vvw.AniverseBackend.security.JwtUtil;
import com.vvw.AniverseBackend.service.AuthService;
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
    private final JwtUtil jwtUtil;

    @Override
    @Transactional
    public UserResponseDto signup(CreateUserDto createUserDto) {
        if(userRepository.existsByUsername(createUserDto.getUsername())){
            throw new IllegalArgumentException("The user already exists");
        }
        User user = modelMapper.map(createUserDto, User.class);
        user.setPasswordHash(passwordEncoder.encode(createUserDto.getPassword()));
        user = userRepository.save(user);
        return modelMapper.map(user, UserResponseDto.class);
    }

    public LoginResponseDto login(LoginRequestDto loginRequestDto){
        Authentication authentication  = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequestDto.getUsername(), loginRequestDto.getPassword()));
        User user = (User) authentication.getPrincipal();
        String token = jwtUtil.generateAccessToken(user);
        return new LoginResponseDto();

    }
}
