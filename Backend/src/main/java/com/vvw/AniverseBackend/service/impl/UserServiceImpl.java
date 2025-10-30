package com.vvw.AniverseBackend.service.impl;
import java.util.List;

import org.modelmapper.ModelMapper;
// import org.springframework.boot.autoconfigure.security.SecurityProperties.User;
import org.springframework.stereotype.Service;

import com.vvw.AniverseBackend.dto.AddUserRequestDto;
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
    public List<UserDto> getAllUsers(){
        return userRepository
            .findAll()
            .stream()
            .map(user -> modelMapper.map(user, UserDto.class)).toList();
    }

    @Override
    public UserDto createNewUser(AddUserRequestDto addUserRequestDto){
        User user = modelMapper.map(addUserRequestDto, User.class);
        UserDto newUser = modelMapper.map(userRepository.save(user), UserDto.class);

        return newUser;
    }
}
