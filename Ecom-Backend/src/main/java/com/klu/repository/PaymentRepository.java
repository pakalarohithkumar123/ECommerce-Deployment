package com.klu.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.klu.model.Payment;

public interface PaymentRepository
        extends JpaRepository<Payment, Long> {
}