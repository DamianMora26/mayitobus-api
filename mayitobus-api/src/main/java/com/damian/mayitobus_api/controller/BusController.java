package com.damian.mayitobus_api.controller;

import com.damian.mayitobus_api.dto.BusResponse;
import com.damian.mayitobus_api.dto.CreateBusRequest;
import com.damian.mayitobus_api.service.BusService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/buses")
public class BusController {

    private final BusService busService;

    public BusController(BusService busService) {
        this.busService = busService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BusResponse createBus(@Valid @RequestBody CreateBusRequest request) {
        return busService.createBus(request);
    }

    @GetMapping
    public List<BusResponse> getBuses() {
        return busService.getBuses();
    }

    @PatchMapping("/{busId}/deactivate")
    public BusResponse deactivateBus(@PathVariable Long busId) {
        return busService.updateStatus(busId, "INACTIVE");
    }

    @PatchMapping("/{busId}/activate")
    public BusResponse activateBus(@PathVariable Long busId) {
        return busService.updateStatus(busId, "ACTIVE");
    }
}
