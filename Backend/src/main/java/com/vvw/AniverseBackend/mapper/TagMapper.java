package com.vvw.AniverseBackend.mapper;

import org.mapstruct.Mapper;

import com.vvw.AniverseBackend.dto.TagDto;
import com.vvw.AniverseBackend.entity.Tag;

@Mapper(componentModel = "spring")
public interface TagMapper {
    TagDto toTagDto(Tag tag);

    Tag toTagEntity(TagDto tagDto);
}
