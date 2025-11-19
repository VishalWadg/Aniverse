package com.vvw.AniverseBackend.controller;

import com.vvw.AniverseBackend.dto.CreateUserDto;
import com.vvw.AniverseBackend.dto.LoginRequestDto;
import com.vvw.AniverseBackend.dto.AuthenticationResponseDto;
import com.vvw.AniverseBackend.dto.UserResponseDto;
import com.vvw.AniverseBackend.dto.internal.TokenRotationResponse;
import com.vvw.AniverseBackend.service.AuthService;
import com.vvw.AniverseBackend.service.RefreshTokenService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;
    private final RefreshTokenService refreshTokenService;
    @PostMapping("/signup")
    public ResponseEntity<UserResponseDto> signup(@RequestBody CreateUserDto createUserDto){
        return new ResponseEntity<>(authService.signup(createUserDto), HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthenticationResponseDto> login(@RequestBody LoginRequestDto loginRequestDto){
        Long maxAgeSeconds = refreshTokenService.getRefreshTokenDurationSeconds();
        AuthenticationResponseDto loginResponsDto = authService.login(loginRequestDto);
        String refToken= loginResponsDto.getRefToken();
        loginResponsDto.setRefToken(null);
        ResponseCookie cookie = ResponseCookie.from("refresh_token",refToken)
                .httpOnly(true)
                .secure(false)  // TODO: MAKE IT TRUE IN PROD
                .path("/api/v1/auth/refresh")
                .maxAge(maxAgeSeconds)
                .sameSite("Strict")
                .build();
        return ResponseEntity.ok().header(HttpHeaders.SET_COOKIE, cookie.toString()).body(loginResponsDto);
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthenticationResponseDto> refresh(@CookieValue(name = "refresh_token") String refToken){
        AuthenticationResponseDto response = authService.refreshToken(refToken);
        String newToken = response.getRefToken();
        response.setRefToken(null);
        ResponseCookie cookie = ResponseCookie.from("refresh_token", newToken)
                .httpOnly(true)
                .secure(false) // TODO: MAKE IT TRUE IN PROD
                .path("/api/v1/auth/refresh")
                .maxAge(refreshTokenService.getRefreshTokenDurationSeconds())
                .sameSite("Strict")
                .build();
        return ResponseEntity.ok().header(HttpHeaders.SET_COOKIE, cookie.toString()).body(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@CookieValue(name = "refresh_token") String token){
        authService.logout(token);
        ResponseCookie cleanCookie = ResponseCookie.from("refresh_token", "")
                .path("/api/auth/refresh")
                .maxAge(0)
                .build();
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cleanCookie.toString())
                .build();
    }
}
