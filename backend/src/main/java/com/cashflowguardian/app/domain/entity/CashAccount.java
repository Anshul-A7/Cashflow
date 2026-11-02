package com.cashflowguardian.app.domain.entity;

import com.cashflowguardian.app.domain.enums.AccountType;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "cash_accounts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CashAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "business_id", nullable = false)
    private Business business;

    @Column(name = "account_name", nullable = false, length = 100)
    private String accountName;

    @Enumerated(EnumType.STRING)
    @Column(name = "account_type", nullable = false, length = 30)
    private AccountType accountType;

    @Column(name = "account_number", length = 50)
    private String accountNumber;

    @Column(name = "bank_name", length = 100)
    private String bankName;

    @Builder.Default
    @Column(name = "current_balance", nullable = false, precision = 15, scale = 2)
    private BigDecimal currentBalance = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt = OffsetDateTime.now();
}

