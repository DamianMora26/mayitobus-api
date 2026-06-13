package com.damian.mayitobus_api.dto;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public class CreateTripRequest {

    @NotNull
    private Long routeId;

    @NotNull
    private Long busId;

    @NotNull
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
