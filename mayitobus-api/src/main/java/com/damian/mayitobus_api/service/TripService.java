package com.damian.mayitobus_api.service;

import com.damian.mayitobus_api.dto.CreateTripRequest;
import com.damian.mayitobus_api.dto.TripResponse;
import com.damian.mayitobus_api.entity.Bus;
import com.damian.mayitobus_api.entity.Route;
import com.damian.mayitobus_api.entity.Trip;
import com.damian.mayitobus_api.repository.BusRepository;
import com.damian.mayitobus_api.repository.RouteRepository;
import com.damian.mayitobus_api.repository.TripRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class TripService {

    private final TripRepository tripRepository;
    private final RouteRepository routeRepository;
    private final BusRepository busRepository;
    private final TimeService timeService;

    public TripService(TripRepository tripRepository, RouteRepository routeRepository, BusRepository busRepository, TimeService timeService) {
        this.tripRepository = tripRepository;
        this.routeRepository = routeRepository;
        this.busRepository = busRepository;
        this.timeService = timeService;
    }

    @Transactional
    public TripResponse createTrip(CreateTripRequest request) {
        Route route = routeRepository.findById(request.getRouteId())
                .orElseThrow(() -> new IllegalArgumentException("La ruta no existe"));

        if (!Boolean.TRUE.equals(route.getActive())) {
            throw new IllegalArgumentException("La ruta no esta activa");
        }

        Bus bus = busRepository.findById(request.getBusId())
                .orElseThrow(() -> new IllegalArgumentException("El autobus no existe"));

        if (!"ACTIVE".equalsIgnoreCase(bus.getStatus())) {
            throw new IllegalArgumentException("El autobus no esta activo");
        }

        if (!request.getDepartureDateTime().isAfter(timeService.now())) {
            throw new IllegalArgumentException("debe ser una fecha futura");
        }

        LocalDateTime departureDateTime = request.getDepartureDateTime();
        LocalDateTime estimatedArrivalDateTime = departureDateTime.plusMinutes(route.getEstimatedDurationMinutes());

        if (tripRepository.existsByBus_IdAndDepartureDateTime(bus.getId(), departureDateTime)) {
            throw new IllegalArgumentException("El autobus ya tiene un viaje programado en esa fecha y hora");
        }

        if (hasOverlappingTrip(bus.getId(), departureDateTime, estimatedArrivalDateTime)) {
            throw new IllegalArgumentException("El autobus ya tiene un viaje programado que se cruza con ese horario");
        }

        Trip trip = new Trip();
        trip.setRoute(route);
        trip.setBus(bus);
        trip.setDepartureDateTime(departureDateTime);
        trip.setStatus("SCHEDULED");
        trip.setCreatedAt(timeService.now());

        return new TripResponse(tripRepository.save(trip));
    }

    private boolean hasOverlappingTrip(Long busId, LocalDateTime departureDateTime, LocalDateTime estimatedArrivalDateTime) {
        return tripRepository.findByBus_IdAndStatusNotIgnoreCaseOrderByDepartureDateTimeAsc(busId, "CANCELLED")
                .stream()
                .anyMatch(existingTrip -> {
                    LocalDateTime existingDeparture = existingTrip.getDepartureDateTime();
                    LocalDateTime existingArrival = existingDeparture.plusMinutes(existingTrip.getRoute().getEstimatedDurationMinutes());

                    return departureDateTime.isBefore(existingArrival) && estimatedArrivalDateTime.isAfter(existingDeparture);
                });
    }

    @Transactional(readOnly = true)
    public List<TripResponse> getTrips() {
        return tripRepository.findAllByOrderByDepartureDateTimeAsc()
                .stream()
                .map(TripResponse::new)
                .toList();
    }

    @Transactional
    public TripResponse cancelTrip(Long tripId) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new IllegalArgumentException("El viaje no existe"));

        if (!"SCHEDULED".equalsIgnoreCase(trip.getStatus())) {
            throw new IllegalArgumentException("El viaje no esta programado");
        }

        trip.setStatus("CANCELLED");

        return new TripResponse(tripRepository.save(trip));
    }
}
