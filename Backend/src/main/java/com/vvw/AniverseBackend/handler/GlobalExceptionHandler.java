package com.vvw.AniverseBackend.handler;

import com.vvw.AniverseBackend.dto.ApiErrorDto;
import com.vvw.AniverseBackend.dto.ApiValidationErrorDto;
import com.vvw.AniverseBackend.exceptions.*;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingRequestCookieException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.fasterxml.jackson.databind.exc.InvalidFormatException;
import com.fasterxml.jackson.databind.exc.UnrecognizedPropertyException;
import com.fasterxml.jackson.databind.JsonMappingException.Reference;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

        // --- CATEGORY 1: Client Errors (WARN, No Stack Trace) ---

        @ExceptionHandler(EntityNotFoundException.class)
        public ResponseEntity<ApiErrorDto> handleEntityNotFound(EntityNotFoundException ex,
                        HttpServletRequest request) {
                // Log meaningful info, but keep it quiet
                log.warn("Resource Not Found: {} | URL: {}", ex.getMessage(), request.getRequestURI());
                ApiErrorDto apiErrorDto = new ApiErrorDto(
                                HttpStatus.NOT_FOUND.value(),
                                "Resource Not Found",
                                ex.getMessage(),
                                request.getRequestURI());
                return new ResponseEntity<>(apiErrorDto, HttpStatus.NOT_FOUND);
        }

        @ExceptionHandler(DuplicateResourceException.class)
        public ResponseEntity<ApiErrorDto> handleDuplicateResource(DuplicateResourceException ex,
                        HttpServletRequest request) {
                log.warn("Duplicate Resource: {} | URL: {}", ex.getMessage(), request.getRequestURI());
                ApiErrorDto apiErrorDto = new ApiErrorDto(
                                HttpStatus.CONFLICT.value(),
                                "Duplicate Not Allowed",
                                ex.getMessage(),
                                request.getRequestURI());

                return new ResponseEntity<>(apiErrorDto, HttpStatus.CONFLICT);
        }

        @ExceptionHandler(InvalidOperationException.class)
        public ResponseEntity<ApiErrorDto> handleInvalidOperation(InvalidOperationException ex,
                        HttpServletRequest request) {
                log.warn("Invalid Operation: {} | URL: {}", ex.getMessage(), request.getRequestURI());
                ApiErrorDto apiErrorDto = new ApiErrorDto(
                                HttpStatus.BAD_REQUEST.value(),
                                "Operation Not Allowed",
                                ex.getMessage(),
                                request.getRequestURI());

                return new ResponseEntity<>(apiErrorDto, HttpStatus.BAD_REQUEST);
        }

        @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
        public ResponseEntity<ApiErrorDto> handleMethodNotSupported(HttpRequestMethodNotSupportedException ex, HttpServletRequest request) {
                log.warn("Method Not Supported: {} tried {}  | URL: {}", request.getRemoteAddr(), ex.getMethod(), request.getRequestURI());
                
                String supportedMethods = ex.getSupportedMethods() != null 
                        ? String.join(", ", ex.getSupportedMethods()) 
                        : "Unknown";
                
                ApiErrorDto apiErrorDto = new ApiErrorDto(
                        HttpStatus.METHOD_NOT_ALLOWED.value(),
                        "Method Not Allowed",
                        String.format("The HTTP '%s' method is not supported at this URL. Supported Methods : %s", ex.getMethod(), supportedMethods),
                        request.getRequestURI());
                return ResponseEntity
                        .status(HttpStatus.METHOD_NOT_ALLOWED)
                        .header(HttpHeaders.ALLOW, supportedMethods)
                        .body(apiErrorDto);
        }

        @ExceptionHandler(HttpMessageNotReadableException.class)
        public ResponseEntity<ApiErrorDto> handleHttpMessageNotReadable(
                HttpMessageNotReadableException ex, 
                HttpServletRequest request){
                
                log.warn("Malformed JSON or Missing Body: {} | URL: {}", ex.getMessage(), request.getRequestURI());
                String detailedMessage = "The request body is missing or the JSON is malformed.";
                
                // 1. Handle Unrecognized Fields
                if (ex.getCause() instanceof UnrecognizedPropertyException unrecognizedException) {
                        String rogueField = unrecognizedException.getPropertyName();
                        String allowedFields = unrecognizedException.getKnownPropertyIds().toString();
                        detailedMessage = String.format("Unrecognized field '%s'. This API is strict. Allowed fields are: %s", 
                                rogueField, allowedFields);
                }
                // 2. Handle Data Type Mismatches (String instead of Integer)
                else if(ex.getCause() instanceof InvalidFormatException invalidFormatException){
                        String fieldPath = invalidFormatException.getPath().stream()
                                .map(Reference::getFieldName)
                                .reduce((first, second) -> first + "." + second)
                                .orElse("unknown_field");
                        
                        detailedMessage = String.format("Invalid value provided for field '%s'. Expected type: %s", 
                                        fieldPath, 
                                        invalidFormatException.getTargetType().getSimpleName());
                }
                // 3. Handle Completely Empty Body
                else if(ex.getMessage() != null && ex.getMessage().contains("Required request body is missing")){
                        detailedMessage = "The request body is missing.";       
                }
                ApiErrorDto apiErrorDto = new ApiErrorDto(
                        HttpStatus.BAD_REQUEST.value(),
                        "Bad Request",
                        detailedMessage,
                        request.getRequestURI()
                );

                return new ResponseEntity<>(apiErrorDto, HttpStatus.BAD_REQUEST);
        }

        @ExceptionHandler(DataIntegrityViolationException.class)
        public ResponseEntity<ApiErrorDto> handleDataIntegrityViolation(
                DataIntegrityViolationException ex, 
                HttpServletRequest request) {
        
                // 1. Get the actual database error message (e.g., from PostgreSQL/MySQL)
                String rootMsg = ex.getMostSpecificCause().getMessage();
                log.warn("Database Constraint Violation: {} | URL: {}", rootMsg, request.getRequestURI());

                String detailedMessage = "A database conflict occurred.";
                HttpStatus status = HttpStatus.CONFLICT;

                // 2. Safely parse the message for specific database constraints
                if (rootMsg != null) {
                        String lowerCaseMsg = rootMsg.toLowerCase();
                        
                        // Handle Unique Constraint Violations (e.g., username/email already taken)
                        if (lowerCaseMsg.contains("duplicate") || lowerCaseMsg.contains("unique constraint")) {
                        detailedMessage = "A record with this exact information already exists. Please use a different value.";
                        } 
                        // Handle Foreign Key Violations (e.g., trying to comment on a deleted post)
                        else if (lowerCaseMsg.contains("foreign key") || lowerCaseMsg.contains("violates foreign key constraint")) {
                        detailedMessage = "You are trying to reference a resource that does not exist or was deleted.";
                        status = HttpStatus.BAD_REQUEST; // 400 or 422 is usually better than 409 for missing parents
                        }
                        // Handle Not Null Violations
                        else if (lowerCaseMsg.contains("not null") || lowerCaseMsg.contains("cannot be null")) {
                        detailedMessage = "A required piece of data was missing from your request.";
                        status = HttpStatus.BAD_REQUEST;
                        }
                }

                ApiErrorDto apiErrorDto = new ApiErrorDto(
                        status.value(),
                        status.getReasonPhrase(),
                        detailedMessage,
                        request.getRequestURI()
                );

                return new ResponseEntity<>(apiErrorDto, status);
        }

        @ExceptionHandler(ResourceAccessDeniedException.class)
        public ResponseEntity<ApiErrorDto> handleResourceAccessDenied(ResourceAccessDeniedException ex,
                        HttpServletRequest request) {
                log.warn("Resource Access Denied: {} | URL: {}", ex.getMessage(), request.getRequestURI());
                ApiErrorDto apiErrorDto = new ApiErrorDto(
                                HttpStatus.FORBIDDEN.value(),
                                "Forbidden",
                                ex.getMessage(),
                                request.getRequestURI());

                return new ResponseEntity<>(apiErrorDto, HttpStatus.FORBIDDEN);
        }

        @ExceptionHandler(TokenException.class)
        public ResponseEntity<ApiErrorDto> handleTokenException(TokenException ex, HttpServletRequest request) {
                log.warn("Token Exception: {} | URL: {}", ex.getMessage(), request.getRequestURI());
                ApiErrorDto apiErrorDto = new ApiErrorDto(
                                HttpStatus.UNAUTHORIZED.value(),
                                "Unauthorized",
                                ex.getMessage(),
                                request.getRequestURI());

                return new ResponseEntity<>(apiErrorDto, HttpStatus.UNAUTHORIZED);
        }

        // ---- Validation Errors ----

        @ExceptionHandler(BadCredentialsException.class)
        public ResponseEntity<ApiErrorDto> handleBadCredentials(BadCredentialsException ex,
                        HttpServletRequest request) {
                log.warn("Invalid username or password");
                ApiErrorDto apiErrorDto = new ApiErrorDto(
                                HttpStatus.UNAUTHORIZED.value(), // 401
                                "Unauthorized",
                                "Invalid Username or Password",
                                request.getRequestURI());
                return new ResponseEntity<>(apiErrorDto, HttpStatus.UNAUTHORIZED);
        }

        @ExceptionHandler(MethodArgumentNotValidException.class)
        public ResponseEntity<ApiErrorDto> handleMethodArgumentNotValid(MethodArgumentNotValidException ex,
                        HttpServletRequest request) {
                log.warn("Method Argument Invalid Exception: {} | URL: {}", ex.getMessage(), request.getRequestURI());
                Map<String, String> errors = new HashMap<>();
                ex.getBindingResult().getFieldErrors()
                                .forEach((error) -> errors.put(error.getField(), error.getDefaultMessage()));

                ApiValidationErrorDto apiValidationErrorDto = new ApiValidationErrorDto(
                                HttpStatus.BAD_REQUEST.value(),
                                "Input validation failed",
                                request.getRequestURI(),
                                errors);
                return new ResponseEntity<>(apiValidationErrorDto, HttpStatus.BAD_REQUEST);
        }

        @ExceptionHandler(MissingRequestCookieException.class)
        public ResponseEntity<ApiErrorDto> handleMissingCookie(MissingRequestCookieException ex,
                        HttpServletRequest request) {
                // If the refresh token cookie is missing, it just means the user is anonymous.
                ApiErrorDto apiErrorDto = new ApiErrorDto(
                                HttpStatus.UNAUTHORIZED.value(), // Return 401 (standard for auth failures)
                                "Unauthorized",
                                "No refresh token provided.",
                                request.getRequestURI());
                return new ResponseEntity<>(apiErrorDto, HttpStatus.UNAUTHORIZED);
        }

        @ExceptionHandler(AccessDeniedException.class)
        public void handleAccessDeniedException(AccessDeniedException ex) {
                // By re-throwing it, we intercept it before it hits the generic Exception.class
                // catch-all.
                // Throwing it back out allows it to reach Spring Security's custom handlers!
                throw ex;
        }

        // --- CATEGORY 2: Server Errors (ERROR, With Stack Trace) ---

        @ExceptionHandler(Exception.class)
        public ResponseEntity<ApiErrorDto> handleGenericException(Exception ex, HttpServletRequest request) {

                // CRITICAL: Log the full stack trace ('ex') so you can debug the crash
                log.error("Unhandled Exception: {} | URL: {}", ex.getMessage(), request.getRequestURI(), ex);

                ApiErrorDto apiErrorDto = new ApiErrorDto(
                                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                                "Internal Server Error",
                                ex.getMessage(),
                                request.getRequestURI());

                return new ResponseEntity<>(apiErrorDto, HttpStatus.INTERNAL_SERVER_ERROR);
        }

}
