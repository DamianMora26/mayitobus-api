package com.damian.mayitobus_api.dto;

public class SeatResponse {

    private Integer seatNumber;
    private String status;
    private Long ticketId;
    private String passengerName;

    public SeatResponse(Integer seatNumber, String status, Long ticketId, String passengerName) {
        this.seatNumber = seatNumber;
        this.status = status;
        this.ticketId = ticketId;
        this.passengerName = passengerName;
    }

    public Integer getSeatNumber() {
        return seatNumber;
    }

    public String getStatus() {
        return status;
    }

    public Long getTicketId() {
        return ticketId;
    }

    public String getPassengerName() {
        return passengerName;
    }
}
