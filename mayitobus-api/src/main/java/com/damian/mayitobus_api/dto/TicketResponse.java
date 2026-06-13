package com.damian.mayitobus_api.dto;

import com.damian.mayitobus_api.entity.Ticket;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class TicketResponse {

    private Long id;
    private Long tripId;
    private String origin;
    private String destination;
    private LocalDateTime departureDateTime;
    private Long busId;
    private String busNumber;
    private Long sellerUserId;
    private String sellerName;
    private String passengerName;
    private Integer seatNumber;
    private BigDecimal price;
    private String passengerType;
    private BigDecimal discountPercentage;
    private String status;
    private LocalDateTime soldAt;
    private LocalDateTime cancelledAt;

    public TicketResponse(Ticket ticket) {
        this.id = ticket.getId();
        this.tripId = ticket.getTrip().getId();
        this.origin = ticket.getTrip().getRoute().getOrigin();
        this.destination = ticket.getTrip().getRoute().getDestination();
        this.departureDateTime = ticket.getTrip().getDepartureDateTime();
        this.busId = ticket.getTrip().getBus().getId();
        this.busNumber = ticket.getTrip().getBus().getBusNumber();
        this.sellerUserId = ticket.getSeller().getId();
        this.sellerName = ticket.getSeller().getFullName();
        this.passengerName = ticket.getPassengerName();
        this.seatNumber = ticket.getSeatNumber();
        this.price = ticket.getPrice();
        this.passengerType = ticket.getPassengerType();
        this.discountPercentage = ticket.getDiscountPercentage();
        this.status = ticket.getStatus();
        this.soldAt = ticket.getSoldAt();
        this.cancelledAt = ticket.getCancelledAt();
    }

    public Long getId() {
        return id;
    }

    public Long getTripId() {
        return tripId;
    }

    public String getOrigin() {
        return origin;
    }

    public String getDestination() {
        return destination;
    }

    public LocalDateTime getDepartureDateTime() {
        return departureDateTime;
    }

    public Long getBusId() {
        return busId;
    }

    public String getBusNumber() {
        return busNumber;
    }

    public Long getSellerUserId() {
        return sellerUserId;
    }

    public String getSellerName() {
        return sellerName;
    }

    public String getPassengerName() {
        return passengerName;
    }

    public Integer getSeatNumber() {
        return seatNumber;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public String getPassengerType() {
        return passengerType;
    }

    public BigDecimal getDiscountPercentage() {
        return discountPercentage;
    }

    public String getStatus() {
        return status;
    }

    public LocalDateTime getSoldAt() {
        return soldAt;
    }

    public LocalDateTime getCancelledAt() {
        return cancelledAt;
    }
}
