package com.cashflowguardian.app.service;

import com.cashflowguardian.app.config.JwtTokenProvider;
import com.cashflowguardian.app.domain.entity.Business;
import com.cashflowguardian.app.domain.entity.CashAccount;
import com.cashflowguardian.app.domain.entity.User;
import com.cashflowguardian.app.domain.enums.AccountType;
import com.cashflowguardian.app.repository.BusinessRepository;
import com.cashflowguardian.app.repository.CashAccountRepository;
import com.cashflowguardian.app.repository.UserRepository;
import com.cashflowguardian.app.web.dto.AuthRequest;
import com.cashflowguardian.app.web.dto.AuthResponse;
import com.cashflowguardian.app.web.dto.BusinessDto;
import com.cashflowguardian.app.web.dto.RegisterRequest;
import com.cashflowguardian.app.web.dto.UserSummaryDto;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final BusinessRepository businessRepository;
    private final CashAccountRepository cashAccountRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new IllegalArgumentException("An account with the email " + normalizedEmail + " already exists. Please sign in instead.");
        }

        User user = User.builder()
                .email(normalizedEmail)
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName().trim())
                .role("ROLE_BUSINESS_OWNER")
                .build();
        user = userRepository.save(user);

        // Initialize user's primary business workspace
        String cleanTaxId = (request.getTaxId() != null && !request.getTaxId().trim().isEmpty())
                ? request.getTaxId().trim().toUpperCase()
                : null;

        Business business = Business.builder()
                .owner(user)
                .name(request.getBusinessName().trim())
                .taxId(cleanTaxId)
                .currency(request.getCurrency() != null && !request.getCurrency().isBlank() ? request.getCurrency() : "INR")
                .build();
        business = businessRepository.save(business);

        // Initialize primary operating account with 0.00 balance (clean, real empty state)
        CashAccount primaryAccount = CashAccount.builder()
                .business(business)
                .accountName("Primary Operating Account")
                .accountType(AccountType.BANK_CHECKING)
                .bankName("Primary Bank")
                .accountNumber("MAIN-001")
                .currentBalance(BigDecimal.ZERO)
                .build();
        cashAccountRepository.save(primaryAccount);

        String token = jwtTokenProvider.createToken(user.getEmail(), user.getId());

        return buildAuthResponse(token, user, business);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(AuthRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail().trim().toLowerCase(), request.getPassword())
            );
        } catch (Exception e) {
            throw new BadCredentialsException("Invalid email or password");
        }

        User user = userRepository.findByEmail(request.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        List<Business> businesses = businessRepository.findAllByOwnerId(user.getId());
        Business activeBusiness = businesses.isEmpty() ? null : businesses.get(0);

        String token = jwtTokenProvider.createToken(user.getEmail(), user.getId());
        return buildAuthResponse(token, user, activeBusiness);
    }

    @Transactional(readOnly = true)
    public UserSummaryDto getCurrentUser(String email) {
        User user = userRepository.findByEmail(email.trim().toLowerCase())
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + email));

        List<BusinessDto> businesses = businessRepository.findAllByOwnerId(user.getId())
                .stream()
                .map(this::mapToBusinessDto)
                .collect(Collectors.toList());

        return UserSummaryDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .businesses(businesses)
                .build();
    }

    public Business validateBusinessAccess(Long businessId, String userEmail) {
        User user = userRepository.findByEmail(userEmail.trim().toLowerCase())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        return businessRepository.findByIdAndOwnerId(businessId, user.getId())
                .orElseThrow(() -> new SecurityException("Unauthorized access to business ID: " + businessId));
    }

    @Transactional
    public BusinessDto updateBusiness(Long businessId, BusinessDto request, String userEmail) {
        Business business = validateBusinessAccess(businessId, userEmail);

        if (request.getName() != null && !request.getName().trim().isEmpty()) {
            business.setName(request.getName().trim());
        }
        if (request.getTaxId() != null) {
            business.setTaxId(!request.getTaxId().trim().isEmpty() ? request.getTaxId().trim().toUpperCase() : null);
        }
        if (request.getPhone() != null) {
            business.setPhone(!request.getPhone().trim().isEmpty() ? request.getPhone().trim() : null);
        }
        if (request.getAddress() != null) {
            business.setAddress(!request.getAddress().trim().isEmpty() ? request.getAddress().trim() : null);
        }
        if (request.getCurrency() != null && !request.getCurrency().trim().isEmpty()) {
            business.setCurrency(request.getCurrency().trim().toUpperCase());
        }

        business = businessRepository.save(business);
        return mapToBusinessDto(business);
    }

    @Transactional
    public BusinessDto createBusiness(BusinessDto request, String userEmail) {
        User user = userRepository.findByEmail(userEmail.trim().toLowerCase())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (request.getName() == null || request.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Business name is required");
        }

        String cleanTax = (request.getTaxId() != null && !request.getTaxId().trim().isEmpty())
                ? request.getTaxId().trim().toUpperCase()
                : null;

        Business business = Business.builder()
                .owner(user)
                .name(request.getName().trim())
                .taxId(cleanTax)
                .currency(request.getCurrency() != null && !request.getCurrency().trim().isEmpty() ? request.getCurrency().trim().toUpperCase() : "INR")
                .address(request.getAddress() != null && !request.getAddress().trim().isEmpty() ? request.getAddress().trim() : null)
                .phone(request.getPhone() != null && !request.getPhone().trim().isEmpty() ? request.getPhone().trim() : null)
                .build();

        business = businessRepository.save(business);

        // Initialize primary operating account for the new business
        CashAccount primaryAccount = CashAccount.builder()
                .business(business)
                .accountName("Operating Account")
                .accountType(AccountType.BANK_CHECKING)
                .bankName("Primary Bank")
                .accountNumber("MAIN-001")
                .currentBalance(BigDecimal.ZERO)
                .build();
        cashAccountRepository.save(primaryAccount);

        return mapToBusinessDto(business);
    }

    @Transactional
    public UserSummaryDto updateProfile(com.cashflowguardian.app.web.dto.UpdateProfileRequest request, String currentUserEmail) {
        User user = userRepository.findByEmail(currentUserEmail.trim().toLowerCase())
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + currentUserEmail));

        if (request.getFullName() != null && !request.getFullName().trim().isEmpty()) {
            user.setFullName(request.getFullName().trim());
        }

        if (request.getNewPassword() != null && !request.getNewPassword().trim().isEmpty()) {
            if (request.getNewPassword().length() < 6) {
                throw new IllegalArgumentException("New password must be at least 6 characters long.");
            }
            user.setPassword(passwordEncoder.encode(request.getNewPassword().trim()));
        }

        user = userRepository.save(user);
        return getCurrentUser(user.getEmail());
    }

    private AuthResponse buildAuthResponse(String token, User user, Business activeBusiness) {
        List<BusinessDto> businessDtos = businessRepository.findAllByOwnerId(user.getId())
                .stream()
                .map(this::mapToBusinessDto)
                .collect(Collectors.toList());

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .userId(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .activeBusinessId(activeBusiness != null ? activeBusiness.getId() : null)
                .activeBusinessName(activeBusiness != null ? activeBusiness.getName() : null)
                .businesses(businessDtos)
                .build();
    }

    public BusinessDto mapToBusinessDto(Business b) {
        return BusinessDto.builder()
                .id(b.getId())
                .name(b.getName())
                .taxId(b.getTaxId())
                .currency(b.getCurrency())
                .address(b.getAddress())
                .phone(b.getPhone())
                .createdAt(b.getCreatedAt())
                .build();
    }
}

