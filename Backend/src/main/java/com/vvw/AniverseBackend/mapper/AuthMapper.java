package com.vvw.AniverseBackend.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.vvw.AniverseBackend.dto.AuthenticationResponseDto;
import com.vvw.AniverseBackend.entity.User;

@Mapper(config = MapStructConfig.class, uses = UserMapper.class)
public interface AuthMapper {
    
    @Mapping(target = "token", source = "token")
    @Mapping(target = "refToken", source = "refToken")
    @Mapping(target = "expiresIn", source = "expiresIn")
    @Mapping(target = "user", source = "user")
    @Mapping(target = "tokenType", constant = "Bearer")
    AuthenticationResponseDto toAuthenticationResponseDto(String token, String refToken, long expiresIn, User user);
}
