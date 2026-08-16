package com.vvw.AniverseBackend.mapper;

import com.vvw.AniverseBackend.dto.FeedbackResponseDto;
import com.vvw.AniverseBackend.dto.TagDto;
import com.vvw.AniverseBackend.entity.Feedback;
import com.vvw.AniverseBackend.entity.Tag;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface FeedbackMapper {
    
    FeedbackResponseDto toFeedbackResponseDto(Feedback feedback);
    
    TagDto toTagDto(Tag tag);

}
