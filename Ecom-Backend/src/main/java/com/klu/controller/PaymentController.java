package com.klu.controller;

import com.klu.model.BackgroundJob;
import com.klu.model.Order;
import com.klu.repository.BackgroundJobRepository;
import com.klu.repository.OrderRepository;
import com.klu.service.BackgroundJobProcessor;
import com.razorpay.RazorpayClient;

import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payment")
@CrossOrigin(origins = "http://localhost:5174")
public class PaymentController {

    @Value("${razorpay.key.id}")
    private String keyId;

    @Value("${razorpay.key.secret}")
    private String keySecret;

    private final OrderRepository orderRepository;
    private final BackgroundJobRepository backgroundJobRepository;
    private final BackgroundJobProcessor backgroundJobProcessor;

    public PaymentController(
            OrderRepository orderRepository,
            BackgroundJobRepository backgroundJobRepository,
            BackgroundJobProcessor backgroundJobProcessor) {

        this.orderRepository = orderRepository;
        this.backgroundJobRepository = backgroundJobRepository;
        this.backgroundJobProcessor = backgroundJobProcessor;
    }

    // =========================================================
    // CREATE RAZORPAY ORDER
    // =========================================================

    @PostMapping("/create-order")
    public ResponseEntity<?> createOrder(
            @RequestParam("amount") BigDecimal amount) {

        try {

            if (amount == null ||
                    amount.compareTo(BigDecimal.ZERO) <= 0) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                Map.of(
                                        "success",
                                        false,
                                        "message",
                                        "Invalid amount"
                                )
                        );
            }

            // Create Razorpay client
            RazorpayClient razorpay =
                    new RazorpayClient(
                            keyId,
                            keySecret
                    );

            // Convert rupees to paise
            long amountInPaise =
                    amount
                            .multiply(new BigDecimal("100"))
                            .longValue();

            JSONObject orderRequest =
                    new JSONObject();

            orderRequest.put(
                    "amount",
                    amountInPaise
            );

            orderRequest.put(
                    "currency",
                    "INR"
            );

            orderRequest.put(
                    "receipt",
                    "receipt_" +
                            System.currentTimeMillis()
            );

            // Create Razorpay order
            com.razorpay.Order razorpayOrder =
                    razorpay.orders.create(orderRequest);

            Map<String, Object> response =
                    new HashMap<>();

            response.put(
                    "success",
                    true
            );

            response.put(
                    "keyId",
                    keyId
            );

            response.put(
                    "orderId",
                    razorpayOrder.get("id")
            );

            response.put(
                    "amount",
                    razorpayOrder.get("amount")
            );

            response.put(
                    "currency",
                    "INR"
            );

            return ResponseEntity.ok(response);

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(
                            Map.of(
                                    "success",
                                    false,
                                    "message",
                                    e.getMessage()
                            )
                    );
        }
    }

    // =========================================================
    // VERIFY PAYMENT
    // =========================================================

    @PostMapping("/verify")
    public ResponseEntity<?> verifyPayment(
            @RequestBody Map<String, Object> paymentData) {

        try {

            // -------------------------------------------------
            // Razorpay payment details
            // -------------------------------------------------

            String razorpayOrderId =
                    getString(
                            paymentData,
                            "razorpay_order_id"
                    );

            String razorpayPaymentId =
                    getString(
                            paymentData,
                            "razorpay_payment_id"
                    );

            String razorpaySignature =
                    getString(
                            paymentData,
                            "razorpay_signature"
                    );

            // -------------------------------------------------
            // User ID
            // -------------------------------------------------

            Object userIdObject =
                    paymentData.get("userId");

            if (userIdObject == null) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                Map.of(
                                        "success",
                                        false,
                                        "message",
                                        "User ID is missing. Please sign in again."
                                )
                        );
            }

            Long userId;

            try {

                userId =
                        Long.valueOf(
                                String.valueOf(
                                        userIdObject
                                )
                        );

            } catch (Exception e) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                Map.of(
                                        "success",
                                        false,
                                        "message",
                                        "Invalid user ID"
                                )
                        );
            }

            // -------------------------------------------------
            // Customer details
            // -------------------------------------------------

            String customerName =
                    getString(
                            paymentData,
                            "customerName"
                    );

            String email =
                    getString(
                            paymentData,
                            "email"
                    );

            String phone =
                    getString(
                            paymentData,
                            "phone"
                    );

            String address =
                    getString(
                            paymentData,
                            "address"
                    );

            // -------------------------------------------------
            // Total amount
            // -------------------------------------------------

            Object totalAmountObject =
                    paymentData.get("totalAmount");

            if (totalAmountObject == null) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                Map.of(
                                        "success",
                                        false,
                                        "message",
                                        "Total amount is missing"
                                )
                        );
            }

            BigDecimal totalAmount;

            try {

                totalAmount =
                        new BigDecimal(
                                String.valueOf(
                                        totalAmountObject
                                )
                        );

            } catch (NumberFormatException e) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                Map.of(
                                        "success",
                                        false,
                                        "message",
                                        "Invalid total amount"
                                )
                        );
            }

            // -------------------------------------------------
            // Check Razorpay details
            // -------------------------------------------------

            if (razorpayOrderId == null ||
                    razorpayOrderId.isBlank() ||
                    razorpayPaymentId == null ||
                    razorpayPaymentId.isBlank() ||
                    razorpaySignature == null ||
                    razorpaySignature.isBlank()) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                Map.of(
                                        "success",
                                        false,
                                        "message",
                                        "Payment details are missing"
                                )
                        );
            }

            // -------------------------------------------------
            // Generate Razorpay signature
            // -------------------------------------------------

            String generatedSignature =
                    generateSignature(
                            razorpayOrderId +
                                    "|" +
                                    razorpayPaymentId,
                            keySecret
                    );

            // -------------------------------------------------
            // Verify signature
            // -------------------------------------------------

            if (!generatedSignature.equals(
                    razorpaySignature)) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                Map.of(
                                        "success",
                                        false,
                                        "message",
                                        "Invalid payment signature"
                                )
                        );
            }

            // =================================================
            // PAYMENT SUCCESSFUL
            // =================================================

            Order order =
                    new Order();

            // User
            order.setUserId(userId);

            // Customer details
            order.setCustomerName(customerName);

            order.setEmail(email);

            order.setPhone(phone);

            order.setAddress(address);

            // Amount
            order.setTotalAmount(totalAmount);

            // Payment status
            order.setStatus("PAID");

            // Razorpay payment ID
            order.setPaymentId(
                    razorpayPaymentId
            );

            // Razorpay order ID
            order.setRazorpayOrderId(
                    razorpayOrderId
            );

            // Estimated delivery
            order.setEstimatedDeliveryDate(
                    LocalDate.now().plusDays(5)
            );

            // -------------------------------------------------
            // SAVE ORDER
            // -------------------------------------------------

            Order savedOrder =
                    orderRepository.save(order);

            // =================================================
            // CREATE BACKGROUND EMAIL JOB
            // =================================================

            BackgroundJob job =
                    new BackgroundJob();

            // Link background job to saved order
            job.setOrderId(
                    savedOrder.getId()
            );

            // Job type
            job.setJobType("EMAIL");

            // Initial status
            job.setStatus("PENDING");

            // Job message
            job.setMessage(
                    "Order confirmation email waiting to be sent"
            );

            // Save job
            BackgroundJob savedJob =
                    backgroundJobRepository.save(job);

            // =================================================
            // START BACKGROUND EMAIL PROCESSING
            // =================================================

            backgroundJobProcessor.process(
                    savedJob.getJobId()
            );

            // =================================================
            // RESPONSE
            // =================================================

            Map<String, Object> response =
                    new HashMap<>();

            response.put(
                    "success",
                    true
            );

            response.put(
                    "message",
                    "Payment verified, order placed and email notification started successfully"
            );

            // IMPORTANT:
            // Order.java uses "id", not "orderId"
            response.put(
                    "orderId",
                    savedOrder.getId()
            );

            response.put(
                    "userId",
                    savedOrder.getUserId()
            );

            response.put(
                    "razorpayOrderId",
                    savedOrder.getRazorpayOrderId()
            );

            response.put(
                    "paymentId",
                    savedOrder.getPaymentId()
            );

            response.put(
                    "customerName",
                    savedOrder.getCustomerName()
            );

            response.put(
                    "email",
                    savedOrder.getEmail()
            );

            response.put(
                    "totalAmount",
                    savedOrder.getTotalAmount()
            );

            response.put(
                    "estimatedDeliveryDate",
                    savedOrder.getEstimatedDeliveryDate()
            );

            response.put(
                    "status",
                    savedOrder.getStatus()
            );

            response.put(
                    "emailJobId",
                    savedJob.getJobId()
            );

            return ResponseEntity.ok(response);

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(
                            Map.of(
                                    "success",
                                    false,
                                    "message",
                                    e.getMessage()
                            )
                    );
        }
    }

    // =========================================================
    // GET STRING
    // =========================================================

    private String getString(
            Map<String, Object> data,
            String key) {

        Object value =
                data.get(key);

        if (value == null) {
            return "";
        }

        return String.valueOf(value);
    }

    // =========================================================
    // GENERATE RAZORPAY SIGNATURE
    // =========================================================

    private String generateSignature(
            String data,
            String secret)
            throws Exception {

        Mac sha256Hmac =
                Mac.getInstance(
                        "HmacSHA256"
                );

        SecretKeySpec secretKey =
                new SecretKeySpec(
                        secret.getBytes(),
                        "HmacSHA256"
                );

        sha256Hmac.init(
                secretKey
        );

        byte[] hash =
                sha256Hmac.doFinal(
                        data.getBytes()
                );

        StringBuilder hexString =
                new StringBuilder();

        for (byte b : hash) {

            String hex =
                    Integer.toHexString(
                            0xff & b
                    );

            if (hex.length() == 1) {
                hexString.append('0');
            }

            hexString.append(hex);
        }

        return hexString.toString();
    }
}