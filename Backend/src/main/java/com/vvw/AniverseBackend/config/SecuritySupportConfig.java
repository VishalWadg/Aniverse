package com.vvw.AniverseBackend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.AntPathMatcher;

@Configuration
public class SecuritySupportConfig {
    @Bean
    public AntPathMatcher AntPathMatcher(){
        return  new AntPathMatcher();
    }
}
