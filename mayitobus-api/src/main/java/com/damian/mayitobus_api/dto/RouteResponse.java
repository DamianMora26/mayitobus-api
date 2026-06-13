package com.damian.mayitobus_api.dto;

import com.damian.mayitobus_api.entity.Route;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class RouteResponse {

    private Long id;
    private String origin;
    private String destination;
    private BigDecimal basePrice;
    private Integer estimatedDurationMinutes;
    private Boolean active;
    private LocalDateTime createdAt;

    public RouteResponse(Route route) {
        this.id = route.getId();
        this.origin = route.getOrigin();
        this.destination = route.getDestination();
        this.basePrice = route.getBasePrice();
        this.estimatedDurationMinutes = route.getEstimatedDurationMinutes();
        this.active = route.getActive();
        this.createdAt = route.getCreatedAt();
    }

    public Long getId() {
        return id;
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

    public Integer getEstimatedDurationMinutes() {
        return estimatedDurationMinutes;
    }

    public Boolean getActive() {
        return active;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
