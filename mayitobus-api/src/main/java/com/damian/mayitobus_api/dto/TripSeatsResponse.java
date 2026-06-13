package com.damian.mayitobus_api.dto;

import java.util.List;

public class TripSeatsResponse {

    private Long tripId;
    private Integer capacity;
    private Integer soldSeats;
    private Integer availableSeats;
    private List<SeatResponse> seats;

    public TripSeatsResponse(Long tripId, Integer capacity, Integer soldSeats, List<SeatResponse> seats) {
        this.tripId = tripId;
        this.capacity = capacity;
        this.soldSeats = soldSeats;
        this.availableSeats = capacity - soldSeats;
        this.seats = seats;
    }

    public Long getTripId() {
        return tripId;
    }

    public Integer getCapacity() {
        return capacity;
    }

    public Integer getSoldSeats() {
        return soldSeats;
    }

    public Integer getAvailableSeats() {
        return availableSeats;
    }

    public List<SeatResponse> getSeats() {
        return seats;
    }
}
