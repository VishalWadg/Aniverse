package com.vvw.AniverseBackend.handler;

import com.vvw.AniverseBackend.dto.ApiErrorDto;
import com.vvw.AniverseBackend.dto.ApiValidationErrorDto;
import com.vvw.AniverseBackend.exceptions.*;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingRequestCookieException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    // --- CATEGORY 1: Client Errors (WARN, No Stack Trace) ---

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ApiErrorDto> handleEntityNotFound(EntityNotFoundException ex, HttpServletRequest request){
        // Log meaningful info, but keep it quiet
        log.warn("Resource Not Found: {} | URL: {}", ex.getMessage(), request.getRequestURI());
        ApiErrorDto apiErrorDto = new ApiErrorDto(
                HttpStatus.NOT_FOUND.value(),
                "Resource Not Found",
                ex.getMessage(),
                request.getRequestURI()
        );
        return new ResponseEntity<>(apiErrorDto, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(DuplicateResourceException.class)
    public ResponseEntity<ApiErrorDto> handleDuplicateResource(DuplicateResourceException ex, HttpServletRequest request){
        log.warn("Duplicate Resource: {} | URL: {}", ex.getMessage(), request.getRequestURI());
        ApiErrorDto apiErrorDto = new ApiErrorDto(
                HttpStatus.CONFLICT.value(),
                "Duplicate Not Allowed",
                ex.getMessage(),
                request.getRequestURI()
        );

        return new ResponseEntity<>(apiErrorDto, HttpStatus.CONFLICT);
    }

    @ExceptionHandler(InvalidOperationException.class)
    public ResponseEntity<ApiErrorDto> handleInvalidOperation(InvalidOperationException ex, HttpServletRequest request){
        log.warn("Invalid Operation: {} | URL: {}", ex.getMessage(), request.getRequestURI());
        ApiErrorDto apiErrorDto = new ApiErrorDto(
                HttpStatus.BAD_REQUEST.value(),
                "Operation Not Allowed",
                ex.getMessage(),
                request.getRequestURI()
        );

        return new ResponseEntity<>(apiErrorDto, HttpStatus.BAD_REQUEST);
    }
    @ExceptionHandler(ResourceAccessDeniedException.class)
    public ResponseEntity<ApiErrorDto> handleResourceAccessDenied(ResourceAccessDeniedException ex, HttpServletRequest request){
        log.warn("Resource Access Denied: {} | URL: {}", ex.getMessage(), request.getRequestURI());
        ApiErrorDto apiErrorDto = new ApiErrorDto(
                HttpStatus.FORBIDDEN.value(),
                "Forbidden",
                ex.getMessage(),
                request.getRequestURI()
        );

        return new ResponseEntity<>(apiErrorDto, HttpStatus.FORBIDDEN);
    }
    @ExceptionHandler(TokenException.class)
    public ResponseEntity<ApiErrorDto> handleTokenException(TokenException ex, HttpServletRequest request){
        log.warn("Token Exception: {} | URL: {}", ex.getMessage(), request.getRequestURI());
        ApiErrorDto apiErrorDto = new ApiErrorDto(
                HttpStatus.UNAUTHORIZED.value(),
                "Unauthorized",
                ex.getMessage(),
                request.getRequestURI()
        );

        return new ResponseEntity<>(apiErrorDto, HttpStatus.UNAUTHORIZED);
    }

    // ---- Validation Errors ----

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiErrorDto>handleBadCredentials(BadCredentialsException ex, HttpServletRequest request){
        log.warn("Invalid username or password");
        ApiErrorDto apiErrorDto = new ApiErrorDto(
                HttpStatus.UNAUTHORIZED.value(), //401
                "Unauthorized",
                "Invalid Username or Password",
                request.getRequestURI()
        );
        return new ResponseEntity<>(apiErrorDto, HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorDto> handleMethodArgumentNotValid(MethodArgumentNotValidException ex, HttpServletRequest request){
        log.warn("Method Argument Invalid Exception: {} | URL: {}",ex.getMessage(), request.getRequestURI());
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach((error) ->
                errors.put(error.getField(), error.getDefaultMessage())
        );

        ApiValidationErrorDto apiValidationErrorDto = new ApiValidationErrorDto(
                HttpStatus.BAD_REQUEST.value(),
                "Input validation failed",
                request.getRequestURI(),
                errors
                );
        return new ResponseEntity<>(apiValidationErrorDto, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(MissingRequestCookieException.class)
    public ResponseEntity<ApiErrorDto> handleMissingCookie(MissingRequestCookieException ex, HttpServletRequest request) {
        // If the refresh token cookie is missing, it just means the user is anonymous.
        ApiErrorDto apiErrorDto = new ApiErrorDto(
                HttpStatus.UNAUTHORIZED.value(), // Return 401 (standard for auth failures)
                "Unauthorized",
                "No refresh token provided.",
                request.getRequestURI()
        );
        return new ResponseEntity<>(apiErrorDto, HttpStatus.UNAUTHORIZED);
    }

    // --- CATEGORY 2: Server Errors (ERROR, With Stack Trace) ---

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorDto> handleGenericException(Exception ex, HttpServletRequest request){

        // CRITICAL: Log the full stack trace ('ex') so you can debug the crash
        log.error("Unhandled Exception: {} | URL: {}", ex.getMessage(), request.getRequestURI(), ex);

        ApiErrorDto apiErrorDto = new ApiErrorDto(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "Internal Server Error",
                ex.getMessage(),
                request.getRequestURI()
        );

        return  new ResponseEntity<>(apiErrorDto, HttpStatus.INTERNAL_SERVER_ERROR);
    }

}
