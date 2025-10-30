package com.vvw.AniverseBackend.service;
import java.util.List;

import com.vvw.AniverseBackend.dto.AddUserRequestDto;
import com.vvw.AniverseBackend.dto.UserDto;

public interface UserService {
    List<UserDto> getAllUsers();
    UserDto createNewUser(AddUserRequestDto addUserRequestDto);
}
