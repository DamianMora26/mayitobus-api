package com.damian.mayitobus_api.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public class CreateRouteRequest {

    @NotBlank(message = "Escribe el origen de la ruta")
    @Size(max = 80, message = "El origen no debe pasar de 80 caracteres")
    private String origin;

    @NotBlank(message = "Escribe el destino de la ruta")
    @Size(max = 80, message = "El destino no debe pasar de 80 caracteres")
    private String destination;

    @NotNull(message = "Escribe el precio base de la ruta")
    @DecimalMin(value = "0.01", message = "El precio base debe ser mayor a $0.00")
    @Digits(integer = 8, fraction = 2, message = "El precio base debe tener maximo 2 decimales")
    private BigDecimal basePrice;

    @NotNull(message = "Escribe la duracion estimada de la ruta")
    @Min(value = 1, message = "La duracion debe ser al menos 1 minuto")
    private Integer estimatedDurationMinutes;

    public String getOrigin() {
        return origin;
    }

    public String getDestination() {
        return destination;
    }

    public BigDecimal getBasePrice() {
        return basePrice;
    }

    public Integer getEstimatedDurationMinutes() {
        return estimatedDurationMinutes;
    }
}
