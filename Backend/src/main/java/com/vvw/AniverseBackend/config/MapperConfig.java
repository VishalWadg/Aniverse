package com.vvw.AniverseBackend.config;

import com.vvw.AniverseBackend.dto.CommentResponseDto;
import com.vvw.AniverseBackend.dto.UserResponseDto;
import com.vvw.AniverseBackend.entity.Comment;
import com.vvw.AniverseBackend.entity.User;
import org.modelmapper.TypeMap;
import org.modelmapper.convention.MatchingStrategies;
import org.modelmapper.spi.MatchingStrategy;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.modelmapper.ModelMapper;
import org.springframework.util.AntPathMatcher;

@Configuration
public class MapperConfig {
    
    @Bean
    public ModelMapper ModelMapper() {
        ModelMapper modelMapper = new ModelMapper();
        return modelMapper;
    }

    @Bean
    public AntPathMatcher AntPathMatcher(){
        return  new AntPathMatcher();
    }
}
