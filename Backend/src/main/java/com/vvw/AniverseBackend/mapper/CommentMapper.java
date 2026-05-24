package com.vvw.AniverseBackend.mapper;

import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

import com.vvw.AniverseBackend.dto.CommentAuthorDto;
import com.vvw.AniverseBackend.dto.CommentResponseDto;
import com.vvw.AniverseBackend.dto.CreateCommentDto;
import com.vvw.AniverseBackend.entity.Comment;
import com.vvw.AniverseBackend.entity.User;

@Mapper(config = MapStructConfig.class)
public interface CommentMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "isDeleted", ignore = true)
    @Mapping(target = "post", ignore = true)
    @Mapping(target = "author", ignore = true)
    Comment toEntity(CreateCommentDto dto);

    CommentResponseDto toCommentResponseDto(Comment comment);

    CommentAuthorDto toCommentAuthorDto(User user);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "isDeleted", ignore = true)
    @Mapping(target = "post", ignore = true)
    @Mapping(target = "author", ignore = true)
    void updateCommentFromDto(CreateCommentDto dto, @MappingTarget Comment comment);
}
