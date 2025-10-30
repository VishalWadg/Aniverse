package com.vvw.AniverseBackend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.modelmapper.ModelMapper;

@Configuration
public class MapperConfig {
    
    @Bean
    public ModelMapper ModelMapper() {
        return new ModelMapper();
    }
}
