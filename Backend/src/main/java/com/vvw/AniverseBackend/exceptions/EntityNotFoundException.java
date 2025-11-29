package com.vvw.AniverseBackend.exceptions;

import org.springframework.web.bind.annotation.RestControllerAdvice;


public class EntityNotFoundException extends RuntimeException{
    // 404
    public EntityNotFoundException(String message) {
        super(message);
    }
}
