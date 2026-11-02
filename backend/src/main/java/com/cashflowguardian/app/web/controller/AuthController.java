package com.cashflowguardian.app.web.controller;

import com.cashflowguardian.app.service.AuthService;
import com.cashflowguardian.app.web.dto.AuthRequest;
import com.cashflowguardian.app.web.dto.AuthResponse;
import com.cashflowguardian.app.web.dto.BusinessDto;
import com.cashflowguardian.app.web.dto.RegisterRequest;
import com.cashflowguardian.app.web.dto.UserSummaryDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication & Onboarding", description = "Endpoints for user registration, login, and workspace identity")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @Operation(summary = "Register user and initialize default business workspace")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    @Operation(summary = "Authenticate user credentials and issue stateless JWT token")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @GetMapping("/me")
    @Operation(summary = "Retrieve current authenticated user context and accessible businesses")
    public ResponseEntity<UserSummaryDto> getCurrentUser(Authentication authentication) {
        return ResponseEntity.ok(authService.getCurrentUser(authentication.getName()));
    }

    @PutMapping("/profile")
    @Operation(summary = "Update authenticated user personal profile information")
    public ResponseEntity<UserSummaryDto> updateProfile(
            @Valid @RequestBody com.cashflowguardian.app.web.dto.UpdateProfileRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(authService.updateProfile(request, authentication.getName()));
    }

    @PutMapping("/business/{businessId}")
    @Operation(summary = "Update business workspace profile")
    public ResponseEntity<BusinessDto> updateBusiness(
            @PathVariable Long businessId,
            @RequestBody BusinessDto request,
            Authentication authentication) {
        return ResponseEntity.ok(authService.updateBusiness(businessId, request, authentication.getName()));
    }

    @PostMapping("/business")
    @Operation(summary = "Create an additional business workspace")
    public ResponseEntity<BusinessDto> createBusiness(
            @RequestBody BusinessDto request,
            Authentication authentication) {
        return ResponseEntity.ok(authService.createBusiness(request, authentication.getName()));
    }
}

