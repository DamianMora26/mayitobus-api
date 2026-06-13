package com.damian.mayitobus_api.controller;

import com.damian.mayitobus_api.dto.CreateTripRequest;
import com.damian.mayitobus_api.dto.TripResponse;
import com.damian.mayitobus_api.service.TripService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trips")
public class TripController {

    private final TripService tripService;

    public TripController(TripService tripService) {
        this.tripService = tripService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TripResponse createTrip(@Valid @RequestBody CreateTripRequest request) {
        return tripService.createTrip(request);
    }

    @GetMapping
    public List<TripResponse> getTrips() {
        return tripService.getTrips();
    }

    @PatchMapping("/{tripId}/cancel")
    public TripResponse cancelTrip(@PathVariable Long tripId) {
        return tripService.cancelTrip(tripId);
    }
}
