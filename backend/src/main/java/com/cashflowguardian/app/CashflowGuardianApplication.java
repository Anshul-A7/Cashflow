package com.cashflowguardian.app;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class CashflowGuardianApplication {

    public static void main(String[] args) {
        SpringApplication.run(CashflowGuardianApplication.class, args);
    }
}

