package com.vvw.AniverseBackend.service.impl;


import com.vvw.AniverseBackend.dto.UserResponseDto;
import com.vvw.AniverseBackend.exceptions.EntityNotFoundException;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;


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
    public Page<UserResponseDto> getAllUsers(Pageable pageable) {
        // Call the built-in .map() method directly on the Page object
        return userRepository.findAll(pageable)
                .map(user -> modelMapper.map(user, UserResponseDto.class));
    }

    @Override
    public UserResponseDto getUserProfile(String username) {
        return modelMapper
            .map(userRepository
                    .findByUsername(username)
                    .orElseThrow(() ->
                        new EntityNotFoundException("User Not found with username: "+username+". Failed to get user profile.")),
                UserResponseDto.class);
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return userRepository.findByUsername(username).orElseThrow(() -> new UsernameNotFoundException("User not found with username: "+username));
    }

    // Service to Service methods
    public User findByUsername(String username){
        User user = userRepository.findByUsername(username).orElseThrow(() -> new EntityNotFoundException("User not found with username: "+username));
        return user;
    }

}
