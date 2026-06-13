package com.damian.mayitobus_api.dto;

import com.damian.mayitobus_api.entity.Trip;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class TripResponse {

    private Long id;
    private Long routeId;
    private String origin;
    private String destination;
    private BigDecimal basePrice;
    private Long busId;
    private String busNumber;
    private LocalDateTime departureDateTime;
    private LocalDateTime estimatedArrivalDateTime;
    private String status;
    private LocalDateTime createdAt;

    public TripResponse(Trip trip) {
        this.id = trip.getId();
        this.routeId = trip.getRoute().getId();
        this.origin = trip.getRoute().getOrigin();
        this.destination = trip.getRoute().getDestination();
        this.basePrice = trip.getRoute().getBasePrice();
        this.busId = trip.getBus().getId();
        this.busNumber = trip.getBus().getBusNumber();
        this.departureDateTime = trip.getDepartureDateTime();
        this.estimatedArrivalDateTime = trip.getDepartureDateTime()
                .plusMinutes(trip.getRoute().getEstimatedDurationMinutes());
        this.status = trip.getStatus();
        this.createdAt = trip.getCreatedAt();
    }

    public Long getId() {
        return id;
    }

    public Long getRouteId() {
        return routeId;
    }

    public String getOrigin() {
        return origin;
    }

    public String getDestination() {
        return destination;
    }

    public BigDecimal getBasePrice() {
        return basePrice;
    }

    public Long getBusId() {
        return busId;
    }

    public String getBusNumber() {
        return busNumber;
    }

    public LocalDateTime getDepartureDateTime() {
        return departureDateTime;
    }

    public LocalDateTime getEstimatedArrivalDateTime() {
        return estimatedArrivalDateTime;
    }

    public String getStatus() {
        return status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
