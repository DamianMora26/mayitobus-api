package com.damian.mayitobus_api.controller;

import com.damian.mayitobus_api.dto.CreateRouteRequest;
import com.damian.mayitobus_api.dto.RouteResponse;
import com.damian.mayitobus_api.service.RouteService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/routes")
public class RouteController {

    private final RouteService routeService;

    public RouteController(RouteService routeService) {
        this.routeService = routeService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public RouteResponse createRoute(@Valid @RequestBody CreateRouteRequest request) {
        return routeService.createRoute(request);
    }

    @GetMapping
    public List<RouteResponse> getRoutes() {
        return routeService.getRoutes();
    }

    @PatchMapping("/{routeId}/deactivate")
    public RouteResponse deactivateRoute(@PathVariable Long routeId) {
        return routeService.updateActive(routeId, false);
    }

    @PatchMapping("/{routeId}/activate")
    public RouteResponse activateRoute(@PathVariable Long routeId) {
        return routeService.updateActive(routeId, true);
    }
}
