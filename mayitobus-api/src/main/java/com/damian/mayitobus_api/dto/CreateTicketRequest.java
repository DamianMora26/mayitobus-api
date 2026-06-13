package com.damian.mayitobus_api.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class CreateTicketRequest {

    @NotNull
    private Long tripId;

    @NotNull
    private Long sellerUserId;

    @NotBlank
    @Size(max = 120)
    private String passengerName;

    @NotNull
    @Min(1)
    private Integer seatNumber;

    @NotBlank
    private String passengerType;

    public Long getTripId() {
        return tripId;
    }

    public Long getSellerUserId() {
        return sellerUserId;
    }

    public String getPassengerName() {
        return passengerName;
    }

    public Integer getSeatNumber() {
        return seatNumber;
    }

    public String getPassengerType() {
        return passengerType;
    }
}
