package com.damian.mayitobus_api.service;

import com.damian.mayitobus_api.dto.CreateTripRequest;
import com.damian.mayitobus_api.dto.TripResponse;
import com.damian.mayitobus_api.entity.Bus;
import com.damian.mayitobus_api.entity.Route;
import com.damian.mayitobus_api.entity.Trip;
import com.damian.mayitobus_api.repository.BusRepository;
import com.damian.mayitobus_api.repository.RouteRepository;
import com.damian.mayitobus_api.repository.TripRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TripServiceTest {

    @Mock
    private TripRepository tripRepository;

    @Mock
    private RouteRepository routeRepository;

    @Mock
    private BusRepository busRepository;

    @Mock
    private TimeService timeService;

    @InjectMocks
    private TripService tripService;

    @Test
    void createTripUsesBusinessClockAndCalculatesArrival() {
        LocalDateTime now = LocalDateTime.of(2026, 6, 13, 10, 0);
        LocalDateTime departure = LocalDateTime.of(2026, 6, 13, 12, 0);
        Route route = buildRoute(1L, true, 240);
        Bus bus = buildBus(1L, "ACTIVE");
        CreateTripRequest request = buildTripRequest(1L, 1L, departure);

        when(timeService.now()).thenReturn(now);
        when(routeRepository.findById(1L)).thenReturn(Optional.of(route));
        when(busRepository.findById(1L)).thenReturn(Optional.of(bus));
        when(tripRepository.existsByBus_IdAndDepartureDateTime(1L, departure)).thenReturn(false);
        when(tripRepository.save(any(Trip.class))).thenAnswer(invocation -> {
            Trip trip = invocation.getArgument(0);
            ReflectionTestUtils.setField(trip, "id", 5L);
            return trip;
        });

        TripResponse response = tripService.createTrip(request);

        assertThat(response.getDepartureDateTime()).isEqualTo(departure);
        assertThat(response.getEstimatedArrivalDateTime()).isEqualTo(LocalDateTime.of(2026, 6, 13, 16, 0));
        assertThat(response.getCreatedAt()).isEqualTo(now);
        assertThat(response.getStatus()).isEqualTo("SCHEDULED");
    }

    @Test
    void createTripRejectsPastDepartureUsingBusinessClock() {
        LocalDateTime now = LocalDateTime.of(2026, 6, 13, 10, 0);
        CreateTripRequest request = buildTripRequest(1L, 1L, now.minusMinutes(1));

        when(routeRepository.findById(1L)).thenReturn(Optional.of(buildRoute(1L, true, 120)));
        when(busRepository.findById(1L)).thenReturn(Optional.of(buildBus(1L, "ACTIVE")));
        when(timeService.now()).thenReturn(now);

        assertThatThrownBy(() -> tripService.createTrip(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("debe ser una fecha futura");
    }

    private CreateTripRequest buildTripRequest(Long routeId, Long busId, LocalDateTime departureDateTime) {
        CreateTripRequest request = new CreateTripRequest();
        ReflectionTestUtils.setField(request, "routeId", routeId);
        ReflectionTestUtils.setField(request, "busId", busId);
        ReflectionTestUtils.setField(request, "departureDateTime", departureDateTime);
        return request;
    }

    private Route buildRoute(Long id, Boolean active, Integer durationMinutes) {
        Route route = new Route();
        ReflectionTestUtils.setField(route, "id", id);
        route.setOrigin("Navojoa");
        route.setDestination("Hermosillo");
        route.setBasePrice(new BigDecimal("420.00"));
        route.setEstimatedDurationMinutes(durationMinutes);
        route.setActive(active);
        return route;
    }

    private Bus buildBus(Long id, String status) {
        Bus bus = new Bus();
        ReflectionTestUtils.setField(bus, "id", id);
        bus.setBusNumber("112");
        bus.setCapacity(42);
        bus.setStatus(status);
        return bus;
    }
}
