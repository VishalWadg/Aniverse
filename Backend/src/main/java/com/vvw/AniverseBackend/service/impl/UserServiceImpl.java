package com.vvw.AniverseBackend.service.impl;
import java.util.List;

import org.modelmapper.ModelMapper;
// import org.springframework.boot.autoconfigure.security.SecurityProperties.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.vvw.AniverseBackend.dto.RegisterUserRequestDto;
import com.vvw.AniverseBackend.dto.UserDto;
import com.vvw.AniverseBackend.repository.UserRepository;
import com.vvw.AniverseBackend.service.UserService;
import com.vvw.AniverseBackend.entity.User;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService{
    private final UserRepository userRepository;
    private final ModelMapper modelMapper;

    @Override
    public Page<UserDto> getAllUsers(Pageable pageable) {
        // Call the built-in .map() method directly on the Page object
        return userRepository.findAll(pageable)
                .map(user -> modelMapper.map(user, UserDto.class));
    }

    @Override
    public UserDto createNewUser(RegisterUserRequestDto registerUserRequestDto){
        User user = modelMapper.map(registerUserRequestDto, User.class);
        UserDto newUser = modelMapper.map(userRepository.save(user), UserDto.class);

        return newUser;
    }

    // Service to Service methods
    public User findByUsername(String username){
        User user = userRepository.findByUsername(username).orElseThrow(() -> new IllegalArgumentException("User not found in FindByUsername in UserServiceImpl"));
        return user;
    }

    @Override
    public UserDto getUserProfile(String username) {
        return null;
    }
}
