package com.damian.mayitobus_api.controller;

import com.damian.mayitobus_api.dto.TripSeatsResponse;
import com.damian.mayitobus_api.service.SeatService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/trips/{tripId}/seats")
public class SeatController {

    private final SeatService seatService;

    public SeatController(SeatService seatService) {
        this.seatService = seatService;
    }

    @GetMapping
    public TripSeatsResponse getSeatsByTrip(@PathVariable Long tripId) {
        return seatService.getSeatsByTrip(tripId);
    }
}
