package com.damian.mayitobus_api.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class CreateBusRequest {

    @NotBlank(message = "Escribe el numero del autobus")
    @Size(max = 20, message = "El numero del autobus no debe pasar de 20 caracteres")
    private String busNumber;

    @NotBlank(message = "Escribe las placas del autobus")
    @Size(max = 20, message = "Las placas no deben pasar de 20 caracteres")
    private String licensePlate;

    @NotBlank(message = "Escribe el modelo del autobus")
    @Size(max = 80, message = "El modelo no debe pasar de 80 caracteres")
    private String model;

    @NotNull(message = "Escribe la capacidad del autobus")
    @Min(value = 1, message = "La capacidad debe ser al menos 1 asiento")
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
