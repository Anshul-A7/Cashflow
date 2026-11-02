package com.cashflowguardian.app.service;

import com.cashflowguardian.app.domain.entity.Business;
import com.cashflowguardian.app.domain.entity.CashAccount;
import com.cashflowguardian.app.repository.CashAccountRepository;
import com.cashflowguardian.app.web.dto.CashAccountRequest;
import com.cashflowguardian.app.web.dto.CashAccountResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CashAccountService {

    private final CashAccountRepository cashAccountRepository;
    private final AuthService authService;

    @Transactional
    public CashAccountResponse createAccount(Long businessId, CashAccountRequest request, String userEmail) {
        Business business = authService.validateBusinessAccess(businessId, userEmail);

        CashAccount account = CashAccount.builder()
                .business(business)
                .accountName(request.getAccountName().trim())
                .accountType(request.getAccountType())
                .accountNumber(request.getAccountNumber() != null ? request.getAccountNumber().trim() : null)
                .bankName(request.getBankName() != null ? request.getBankName().trim() : null)
                .currentBalance(request.getInitialBalance())
                .updatedAt(OffsetDateTime.now())
                .build();

        account = cashAccountRepository.save(account);
        return mapToResponse(account);
    }

    @Transactional(readOnly = true)
    public List<CashAccountResponse> getAccounts(Long businessId, String userEmail) {
        authService.validateBusinessAccess(businessId, userEmail);

        return cashAccountRepository.findAllByBusinessIdOrderByAccountNameAsc(businessId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CashAccountResponse getAccountById(Long businessId, Long accountId, String userEmail) {
        authService.validateBusinessAccess(businessId, userEmail);

        CashAccount account = cashAccountRepository.findByIdAndBusinessId(accountId, businessId)
                .orElseThrow(() -> new IllegalArgumentException("Cash account not found: " + accountId));

        return mapToResponse(account);
    }

    @Transactional
    public CashAccountResponse updateAccount(Long businessId, Long accountId, CashAccountRequest request, String userEmail) {
        authService.validateBusinessAccess(businessId, userEmail);

        CashAccount account = cashAccountRepository.findByIdAndBusinessId(accountId, businessId)
                .orElseThrow(() -> new IllegalArgumentException("Cash account not found: " + accountId));

        account.setAccountName(request.getAccountName().trim());
        account.setAccountType(request.getAccountType());
        account.setAccountNumber(request.getAccountNumber() != null ? request.getAccountNumber().trim() : null);
        account.setBankName(request.getBankName() != null ? request.getBankName().trim() : null);
        account.setUpdatedAt(OffsetDateTime.now());

        account = cashAccountRepository.save(account);
        return mapToResponse(account);
    }

    @Transactional
    public void deleteAccount(Long businessId, Long accountId, String userEmail) {
        authService.validateBusinessAccess(businessId, userEmail);

        CashAccount account = cashAccountRepository.findByIdAndBusinessId(accountId, businessId)
                .orElseThrow(() -> new IllegalArgumentException("Cash account not found: " + accountId));

        cashAccountRepository.delete(account);
    }

    public CashAccountResponse mapToResponse(CashAccount account) {
        return CashAccountResponse.builder()
                .id(account.getId())
                .businessId(account.getBusiness().getId())
                .accountName(account.getAccountName())
                .accountType(account.getAccountType())
                .accountNumber(account.getAccountNumber())
                .bankName(account.getBankName())
                .currentBalance(account.getCurrentBalance())
                .updatedAt(account.getUpdatedAt())
                .build();
    }
}

