package com.klu.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.klu.dto.OrderItemRequest;
import com.klu.dto.OrderRequest;
import com.klu.entity.Product;
import com.klu.model.Order;
import com.klu.model.OrderItem;
import com.klu.repository.OrderRepository;
import com.klu.repository.ProductRepository;

@Service
public class OrderService {

    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;

    public OrderService(
            ProductRepository productRepository,
            OrderRepository orderRepository) {

        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
    }

    @Transactional
    public Order createOrder(
            OrderRequest request,
            Long userId) {

        if (request == null ||
                request.getItems() == null ||
                request.getItems().isEmpty()) {

            throw new RuntimeException(
                    "Order items cannot be empty");
        }

        if (userId == null) {
            throw new RuntimeException(
                    "User ID is required");
        }

        Order order = new Order();

        // User
        order.setUserId(userId);

        // Customer details
        order.setCustomerName(
                request.getCustomerName());

        order.setEmail(
                request.getEmail());

        order.setPhone(
                request.getPhone());

        order.setAddress(
                request.getAddress());

        // Initial status
        order.setStatus("PLACED");

        // Delivery date
        order.setEstimatedDeliveryDate(
                LocalDate.now().plusDays(5));

        List<OrderItem> orderItems =
                new ArrayList<>();

        BigDecimal totalAmount =
                BigDecimal.ZERO;

        for (OrderItemRequest itemRequest :
                request.getItems()) {

            if (itemRequest.getProductId() == null) {

                throw new RuntimeException(
                        "Product ID is required");
            }

            if (itemRequest.getQuantity() == null ||
                    itemRequest.getQuantity() <= 0) {

                throw new RuntimeException(
                        "Quantity must be greater than zero");
            }

            Product product =
                    productRepository
                            .findById(
                                    itemRequest.getProductId())
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Product not found"));

            if (product.getStock() <
                    itemRequest.getQuantity()) {

                throw new RuntimeException(
                        "Insufficient stock for "
                                + product.getProductName());
            }

            BigDecimal price =
                    BigDecimal.valueOf(
                            product.getPrice());

            BigDecimal itemTotal =
                    price.multiply(
                            BigDecimal.valueOf(
                                    itemRequest.getQuantity()));

            OrderItem orderItem =
                    new OrderItem();

            orderItem.setOrder(orderItem == null
                    ? order
                    : order);

            orderItem.setProduct(product);

            orderItem.setQuantity(
                    itemRequest.getQuantity());

            orderItem.setPrice(price);

            orderItems.add(orderItem);

            totalAmount =
                    totalAmount.add(itemTotal);

            // Reduce stock
            product.setStock(
                    product.getStock()
                            - itemRequest.getQuantity());

            if (product.getStock() == 0) {

                product.setStatus(
                        "OUT_OF_STOCK");

            } else {

                product.setStatus(
                        "AVAILABLE");
            }

            productRepository.save(product);
        }

        order.setItems(orderItems);

        order.setTotalAmount(
                totalAmount);

        return orderRepository.save(order);
    }
}