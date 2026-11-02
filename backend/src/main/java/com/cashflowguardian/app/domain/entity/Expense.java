package com.cashflowguardian.app.domain.entity;

import com.cashflowguardian.app.domain.enums.ExpenseCategory;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "expenses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Expense {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "business_id", nullable = false)
    private Business business;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cash_account_id")
    private CashAccount cashAccount; // Deducted from this account if paid

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private ExpenseCategory category;

    @Column(nullable = false, length = 150)
    private String payee; // Vendor / Employee / Landlord

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @Column(name = "expense_date", nullable = false)
    private LocalDate expenseDate;

    @Column(name = "due_date")
    private LocalDate dueDate; // Relevant for upcoming/unpaid obligations

    @Builder.Default
    @Column(name = "is_paid", nullable = false)
    private Boolean isPaid = true;

    @Builder.Default
    @Column(name = "is_recurring", nullable = false)
    private Boolean isRecurring = false;

    @Column(name = "recurring_frequency", length = 30)
    private String recurringFrequency; // MONTHLY, QUARTERLY, ANNUALLY

    @Column(length = 500)
    private String description;

    @Builder.Default
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();
}

