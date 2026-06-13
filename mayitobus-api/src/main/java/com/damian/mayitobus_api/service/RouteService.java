package com.damian.mayitobus_api.service;

import com.damian.mayitobus_api.dto.CreateRouteRequest;
import com.damian.mayitobus_api.dto.RouteResponse;
import com.damian.mayitobus_api.entity.Route;
import com.damian.mayitobus_api.repository.RouteRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class RouteService {

    private final RouteRepository routeRepository;

    public RouteService(RouteRepository routeRepository) {
        this.routeRepository = routeRepository;
    }

    public RouteResponse createRoute(CreateRouteRequest request) {
        if (routeRepository.existsByOriginIgnoreCaseAndDestinationIgnoreCase(request.getOrigin(), request.getDestination())) {
            throw new IllegalArgumentException("La ruta ya esta registrada");
        }

        Route route = new Route();
        route.setOrigin(request.getOrigin());
        route.setDestination(request.getDestination());
        route.setBasePrice(request.getBasePrice());
        route.setEstimatedDurationMinutes(request.getEstimatedDurationMinutes());
        route.setActive(true);
        route.setCreatedAt(LocalDateTime.now());

        return new RouteResponse(routeRepository.save(route));
    }

    public List<RouteResponse> getRoutes() {
        return routeRepository.findAll()
                .stream()
                .map(RouteResponse::new)
                .toList();
    }

    public RouteResponse updateActive(Long routeId, Boolean active) {
        Route route = routeRepository.findById(routeId)
                .orElseThrow(() -> new IllegalArgumentException("La ruta no existe"));

        route.setActive(active);

        return new RouteResponse(routeRepository.save(route));
    }
}
