package com.damian.mayitobus_api.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public class CreateRouteRequest {

    @NotBlank
    @Size(max = 80)
    private String origin;

    @NotBlank
    @Size(max = 80)
    private String destination;

    @NotNull
    @DecimalMin(value = "0.01")
    @Digits(integer = 8, fraction = 2)
    private BigDecimal basePrice;

    @NotNull
    @Min(1)
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
