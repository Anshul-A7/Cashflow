package com.cashflowguardian.app.web.controller;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> fieldErrors = new HashMap<>();
        StringBuilder combinedMessage = new StringBuilder();
        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            fieldErrors.put(error.getField(), error.getDefaultMessage());
            if (combinedMessage.length() > 0) {
                combinedMessage.append(". ");
            }
            combinedMessage.append(error.getDefaultMessage());
        }

        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", OffsetDateTime.now().toString());
        body.put("status", HttpStatus.BAD_REQUEST.value());
        body.put("error", "Validation Failed");
        body.put("message", combinedMessage.length() > 0 ? combinedMessage.toString() : "Validation constraints failed. Please verify your inputs.");
        body.put("fieldErrors", fieldErrors);

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgument(IllegalArgumentException ex) {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", OffsetDateTime.now().toString());
        body.put("status", HttpStatus.BAD_REQUEST.value());
        body.put("error", "Invalid Request");
        body.put("message", ex.getMessage() != null ? ex.getMessage() : "Invalid input parameters.");

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, Object>> handleDataIntegrityViolation(DataIntegrityViolationException ex) {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", OffsetDateTime.now().toString());
        body.put("status", HttpStatus.CONFLICT.value());
        body.put("error", "Duplicate Record");
        body.put("message", "A record with these unique details (such as email or code) already exists.");

        return ResponseEntity.status(HttpStatus.CONFLICT).body(body);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, Object>> handleNotReadable(HttpMessageNotReadableException ex) {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", OffsetDateTime.now().toString());
        body.put("status", HttpStatus.BAD_REQUEST.value());
        body.put("error", "Malformed Request");
        body.put("message", "The submitted request format is invalid. Please verify all fields and numbers.");

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<Map<String, Object>> handleBadCredentials(BadCredentialsException ex) {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", OffsetDateTime.now().toString());
        body.put("status", HttpStatus.UNAUTHORIZED.value());
        body.put("error", "Authentication Failed");
        body.put("message", "Invalid email or password. Please verify your login credentials or register a new workspace.");

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(body);
    }

    @ExceptionHandler({SecurityException.class, AccessDeniedException.class})
    public ResponseEntity<Map<String, Object>> handleSecurityException(Exception ex) {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", OffsetDateTime.now().toString());
        body.put("status", HttpStatus.FORBIDDEN.value());
        body.put("error", "Access Denied");
        body.put("message", "You do not have authorization to access or modify this workspace.");

        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(body);
    }

    @ExceptionHandler({NoResourceFoundException.class, EntityNotFoundException.class})
    public ResponseEntity<Map<String, Object>> handleNoResourceFound(Exception ex) {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", OffsetDateTime.now().toString());
        body.put("status", HttpStatus.NOT_FOUND.value());
        body.put("error", "Not Found");
        body.put("message", "The requested business record or resource was not found.");

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(body);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneralException(Exception ex) {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", OffsetDateTime.now().toString());
        body.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
        body.put("error", "Server Error");
        body.put("message", "The financial server encountered a temporary issue. Please try again shortly.");

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
    }
}
