package com.vvw.AniverseBackend.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.vvw.AniverseBackend.dto.FeedbackGroupResponseDto;
import com.vvw.AniverseBackend.entity.FeedbackGroup;

@Mapper(componentModel = "spring", uses = {FeedbackMapper.class})
public interface FeedbackGroupMapper {
    @Mapping(target = "impactCount", expression = "java(group.getFeedbacks() != null ? group.getFeedbacks().size() : 0)")
    FeedbackGroupResponseDto toDto(FeedbackGroup group);
}
    