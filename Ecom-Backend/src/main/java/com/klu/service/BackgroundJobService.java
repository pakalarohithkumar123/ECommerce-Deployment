package com.klu.service;

import org.springframework.stereotype.Service;

import com.klu.model.BackgroundJob;
import com.klu.repository.BackgroundJobRepository;

@Service
public class BackgroundJobService {

    private final BackgroundJobRepository repository;

    private final BackgroundJobProcessor processor;


    public BackgroundJobService(
            BackgroundJobRepository repository,
            BackgroundJobProcessor processor) {

        this.repository = repository;

        this.processor = processor;
    }


    public void startEmailJob(Long orderId) {

        BackgroundJob job =
                new BackgroundJob();


        job.setOrderId(orderId);

        job.setJobType("EMAIL");

        job.setStatus("PENDING");

        job.setMessage(
                "Waiting for email processing"
        );


        BackgroundJob saved =
                repository.save(job);


        System.out.println(
                "EMAIL JOB CREATED"
        );

        System.out.println(
                "Job ID: "
                        + saved.getJobId()
        );

        System.out.println(
                "Order ID: "
                        + saved.getOrderId()
        );


        processor.process(
                saved.getJobId()
        );
    }
}