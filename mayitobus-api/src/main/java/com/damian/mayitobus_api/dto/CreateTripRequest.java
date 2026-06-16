package com.damian.mayitobus_api.dto;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public class CreateTripRequest {

    @NotNull(message = "Selecciona una ruta para programar el viaje")
    private Long routeId;

    @NotNull(message = "Selecciona un autobus para programar el viaje")
    private Long busId;

    @NotNull(message = "Selecciona la fecha y hora de salida")
    private LocalDateTime departureDateTime;

    public Long getRouteId() {
        return routeId;
    }

    public Long getBusId() {
        return busId;
    }

    public LocalDateTime getDepartureDateTime() {
        return departureDateTime;
    }
}
