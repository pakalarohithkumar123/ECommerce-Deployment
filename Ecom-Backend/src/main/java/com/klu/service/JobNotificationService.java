package com.klu.service;

import org.springframework.stereotype.Service;

import com.klu.model.BackgroundJob;

@Service
public class JobNotificationService {

    public void publish(BackgroundJob job) {

        System.out.println(
            "Job Update: Order " +
            job.getOrderId() +
            " | " +
            job.getJobType() +
            " | " +
            job.getStatus()
        );
    }
}