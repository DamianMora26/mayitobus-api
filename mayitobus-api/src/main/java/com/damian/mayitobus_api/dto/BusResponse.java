package com.damian.mayitobus_api.dto;

import com.damian.mayitobus_api.entity.Bus;

import java.time.LocalDateTime;

public class BusResponse {

    private Long id;
    private String busNumber;
    private String licensePlate;
    private String model;
    private Integer capacity;
    private String status;
    private LocalDateTime createdAt;

    public BusResponse(Bus bus) {
        this.id = bus.getId();
        this.busNumber = bus.getBusNumber();
        this.licensePlate = bus.getLicensePlate();
        this.model = bus.getModel();
        this.capacity = bus.getCapacity();
        this.status = bus.getStatus();
        this.createdAt = bus.getCreatedAt();
    }

    public Long getId() {
        return id;
    }

    public String getBusNumber() {
        return busNumber;
    }

    public String getLicensePlate() {
        return licensePlate;
    }

    public String getModel() {
        return model;
    }

    public Integer getCapacity() {
        return capacity;
    }

    public String getStatus() {
        return status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}