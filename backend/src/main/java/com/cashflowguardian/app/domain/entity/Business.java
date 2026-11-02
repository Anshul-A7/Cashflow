package com.cashflowguardian.app.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;

@Entity
@Table(name = "businesses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Business {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(name = "tax_id", length = 50)
    private String taxId; // GSTIN or Tax ID

    @Builder.Default
    @Column(nullable = false, length = 10)
    private String currency = "INR";

    @Column(length = 255)
    private String address;

    @Column(length = 50)
    private String phone;

    @Builder.Default
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();
}

