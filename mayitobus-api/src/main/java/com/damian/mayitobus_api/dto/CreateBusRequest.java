package com.damian.mayitobus_api.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class CreateBusRequest {

    @NotBlank
    @Size(max = 20)
    private String busNumber;

    @NotBlank
    @Size(max = 20)
    private String licensePlate;

    @NotBlank
    @Size(max = 80)
    private String model;

    @NotNull
    @Min(1)
    private Integer capacity;

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
}