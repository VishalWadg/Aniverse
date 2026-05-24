package com.vvw.AniverseBackend.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.vvw.AniverseBackend.dto.CreateUserDto;
import com.vvw.AniverseBackend.dto.CurrentUserProfileDto;
import com.vvw.AniverseBackend.dto.PublicUserProfileDto;
import com.vvw.AniverseBackend.dto.UserResponseDto;
import com.vvw.AniverseBackend.entity.User;

@Mapper(config = MapStructConfig.class)
public interface UserMapper {

    @Mapping(target = "id", ignore = true )
    @Mapping(target = "role", ignore = true )
    @Mapping(target = "createdAt", ignore = true )
    @Mapping(target = "posts", ignore = true )
    @Mapping(target = "comments", ignore = true )
    @Mapping(target = "profilePic", ignore = true)
    @Mapping(target = "bio", ignore = true)
    @Mapping(target = "password", ignore = true)
    User toEntity(CreateUserDto dto);

    UserResponseDto toUserResponseDto(User user);

    @Mapping(target = "postCount", source = "postCount")
    PublicUserProfileDto toPublicUserProfileDto(User user, long postCount);

    @Mapping(target = "postCount", source = "postCount")
    CurrentUserProfileDto toCurrentUserProfileDto(User user, long postCount);
}
