package com.klu.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import com.klu.model.BackgroundJob;
import com.klu.model.Order;
import com.klu.repository.BackgroundJobRepository;
import com.klu.repository.OrderRepository;

@Service
public class BackgroundJobProcessor {

    private final BackgroundJobRepository jobRepository;
    private final JobNotificationService notifier;
    private final JavaMailSender mailSender;
    private final OrderRepository orderRepository;

    @Value("${smartcart.mail.from}")
    private String mailFrom;

    public BackgroundJobProcessor(
            BackgroundJobRepository jobRepository,
            JobNotificationService notifier,
            JavaMailSender mailSender,
            OrderRepository orderRepository) {

        this.jobRepository = jobRepository;
        this.notifier = notifier;
        this.mailSender = mailSender;
        this.orderRepository = orderRepository;
    }

    @Async("taskExecutor")
    public void process(Long jobId) {

        BackgroundJob job = jobRepository.findById(jobId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Background job not found: " + jobId
                        )
                );

        try {

            update(
                    job,
                    "PROCESSING",
                    "Email task started"
            );

            if ("EMAIL".equals(job.getJobType())) {

                sendOrderEmail(job);

            } else {

                throw new RuntimeException(
                        "Unknown job type: " + job.getJobType()
                );
            }

            update(
                    job,
                    "COMPLETED",
                    "Email sent successfully"
            );

        } catch (Exception e) {

            update(
                    job,
                    "FAILED",
                    e.getMessage()
            );
        }
    }

    private void update(
            BackgroundJob job,
            String status,
            String message) {

        job.setStatus(status);
        job.setMessage(message);

        jobRepository.save(job);

        notifier.publish(job);
    }

    private void sendOrderEmail(BackgroundJob job) {

        Order order = orderRepository.findById(
                job.getOrderId()
        ).orElseThrow(() ->
                new RuntimeException(
                        "Order not found: " + job.getOrderId()
                )
        );

        String customerEmail = order.getEmail();
        String customerName = order.getCustomerName();

        SimpleMailMessage mail =
                new SimpleMailMessage();

        mail.setFrom(mailFrom);
        mail.setTo(customerEmail);

        mail.setSubject(
                "SmartCart - Order Confirmation"
        );

        String emailBody =
                "Dear " + customerName + ",\n\n"

                + "Thank you for shopping with SmartCart!\n\n"

                + "Your order has been confirmed successfully.\n\n"

                + "Order ID: "
                + order.getId()
                + "\n"

                + "Total Amount: ₹"
                + order.getTotalAmount()
                + "\n"

                + "Order Status: "
                + order.getStatus()
                + "\n"

                + "Phone: "
                + order.getPhone()
                + "\n"

                + "Delivery Address: "
                + order.getAddress()
                + "\n\n"

                + "Your payment was successful.\n\n"

                + "Thank you for choosing SmartCart.\n\n"

                + "Regards,\n"
                + "SmartCart Team";

        mail.setText(emailBody);

        mailSender.send(mail);
    }
}