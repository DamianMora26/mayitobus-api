package com.damian.mayitobus_api.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "tickets")
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "trip_id", nullable = false)
    private Trip trip;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "seller_user_id", nullable = false)
    private User seller;

    @Column(name = "passenger_name", nullable = false, length = 120)
    private String passengerName;

    @Column(name = "seat_number", nullable = false)
    private Integer seatNumber;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(name = "passenger_type", nullable = false, length = 30)
    private String passengerType;

    @Column(name = "discount_percentage", nullable = false, precision = 5, scale = 2)
    private BigDecimal discountPercentage;

    @Column(nullable = false, length = 30)
    private String status;

    @Column(name = "sold_at", nullable = false)
    private LocalDateTime soldAt;

    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;

    public Long getId() {
        return id;
    }

    public Trip getTrip() {
        return trip;
    }

    public User getSeller() {
        return seller;
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

    public void setTrip(Trip trip) {
        this.trip = trip;
    }

    public void setSeller(User seller) {
        this.seller = seller;
    }

    public void setPassengerName(String passengerName) {
        this.passengerName = passengerName;
    }

    public void setSeatNumber(Integer seatNumber) {
        this.seatNumber = seatNumber;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public void setPassengerType(String passengerType) {
        this.passengerType = passengerType;
    }

    public void setDiscountPercentage(BigDecimal discountPercentage) {
        this.discountPercentage = discountPercentage;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public void setSoldAt(LocalDateTime soldAt) {
        this.soldAt = soldAt;
    }

    public void setCancelledAt(LocalDateTime cancelledAt) {
        this.cancelledAt = cancelledAt;
    }
}
