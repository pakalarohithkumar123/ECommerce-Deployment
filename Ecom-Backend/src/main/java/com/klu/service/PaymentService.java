package com.klu.service;

import java.math.BigDecimal;

import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.klu.model.Payment;
import com.klu.repository.PaymentRepository;
import com.razorpay.RazorpayClient;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final BackgroundJobService backgroundJobService;

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;

    public PaymentService(
            PaymentRepository paymentRepository,
            BackgroundJobService backgroundJobService) {

        this.paymentRepository = paymentRepository;
        this.backgroundJobService = backgroundJobService;
    }

    public Payment createRazorpayOrder(double amount) throws Exception {

        // Check amount
        if (amount <= 0) {
            throw new RuntimeException(
                    "Amount must be greater than zero"
            );
        }

        // Create Razorpay client
        RazorpayClient client =
                new RazorpayClient(
                        razorpayKeyId,
                        razorpayKeySecret
                );

        // Convert rupees to paise
        long amountInPaise =
                BigDecimal.valueOf(amount)
                        .multiply(BigDecimal.valueOf(100))
                        .longValue();

        // Razorpay order options
        JSONObject options = new JSONObject();

        options.put(
                "amount",
                amountInPaise
        );

        options.put(
                "currency",
                "INR"
        );

        options.put(
                "receipt",
                "receipt_" + System.currentTimeMillis()
        );

        // Create Razorpay order
        com.razorpay.Order razorpayOrder =
                client.orders.create(options);

        // Create Payment entity
        Payment payment = new Payment();

        payment.setRazorpayOrderId(
                razorpayOrder.get("id")
        );

        payment.setAmount(
                BigDecimal.valueOf(amount)
        );

        payment.setStatus("CREATED");

        // Save payment
        Payment savedPayment =
                paymentRepository.save(payment);

        return savedPayment;
    }
}