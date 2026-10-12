package com.klu.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.klu.entity.Product;

public interface ProductRepository
        extends JpaRepository<Product, Long> {
}