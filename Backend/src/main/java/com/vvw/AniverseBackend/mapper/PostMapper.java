package com.vvw.AniverseBackend.mapper;

import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

import com.vvw.AniverseBackend.dto.CreatePostDto;
import com.vvw.AniverseBackend.dto.PostResponseDto;
import com.vvw.AniverseBackend.dto.UpdatePostDto;
import com.vvw.AniverseBackend.entity.Post;

import jakarta.persistence.MapKey;

@Mapper(config = MapStructConfig.class, uses = UserMapper.class)
public interface PostMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "wordCount", ignore = true)
    @Mapping(target = "isDeleted", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "author", ignore = true)
    @Mapping(target = "comments", ignore = true)
    Post toEntity(CreatePostDto dto);

    PostResponseDto toPostResponseDto(Post post);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "wordCount", ignore = true)
    @Mapping(target = "isDeleted", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "author", ignore = true)
    @Mapping(target = "comments", ignore = true)
    void updatePostFromDto(UpdatePostDto dto,  @MappingTarget Post post);
}   
