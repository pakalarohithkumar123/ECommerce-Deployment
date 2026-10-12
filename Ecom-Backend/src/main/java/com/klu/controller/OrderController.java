package com.klu.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.klu.dto.OrderRequest;
import com.klu.model.Order;
import com.klu.model.User;
import com.klu.repository.UserRepository;
import com.klu.service.OrderService;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "http://localhost:5173")
public class OrderController {

    private final OrderService orderService;
    private final UserRepository userRepository;

    public OrderController(
            OrderService orderService,
            UserRepository userRepository) {

        this.orderService = orderService;
        this.userRepository = userRepository;
    }

    @PostMapping
    public ResponseEntity<?> createOrder(
            @RequestBody OrderRequest request,
            Authentication authentication) {

        try {

            // Get logged-in user's email
            String email = authentication.getName();

            // Find user from database
            User user = userRepository
                    .findByEmail(email)
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "User not found"));

            // Get user ID
            Long userId = user.getUserId();

            // Create order with user ID
            Order order =
                    orderService.createOrder(
                            request,
                            userId);

            return ResponseEntity.ok(order);

        } catch (Exception e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }
}