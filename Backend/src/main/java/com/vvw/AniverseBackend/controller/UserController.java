package com.vvw.AniverseBackend.controller;

import org.springframework.web.bind.annotation.RestController;

import com.vvw.AniverseBackend.dto.AddUserRequestDto;
import com.vvw.AniverseBackend.dto.UserDto;
import com.vvw.AniverseBackend.service.UserService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
// import org.springframework.web.bind.annotation.RequestParam;


@RestController
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    
    @GetMapping("/users")
    public ResponseEntity<List<UserDto>> getMethodName() {
        return ResponseEntity.ok().body(userService.getAllUsers());
    }
    
    @PostMapping("/users")
    public ResponseEntity<UserDto> createNewUser(@RequestBody @Valid AddUserRequestDto addUserRequestDto){
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.createNewUser(addUserRequestDto));
    }
}
