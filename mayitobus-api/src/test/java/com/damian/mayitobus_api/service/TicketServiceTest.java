package com.damian.mayitobus_api.service;

import com.damian.mayitobus_api.dto.CreateTicketRequest;
import com.damian.mayitobus_api.dto.TicketResponse;
import com.damian.mayitobus_api.entity.Bus;
import com.damian.mayitobus_api.entity.Route;
import com.damian.mayitobus_api.entity.Ticket;
import com.damian.mayitobus_api.entity.Trip;
import com.damian.mayitobus_api.entity.User;
import com.damian.mayitobus_api.repository.TicketRepository;
import com.damian.mayitobus_api.repository.TripRepository;
import com.damian.mayitobus_api.repository.UserRepository;
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
class TicketServiceTest {

    @Mock
    private TicketRepository ticketRepository;

    @Mock
    private TripRepository tripRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private TimeService timeService;

    @InjectMocks
    private TicketService ticketService;

    @Test
    void createTicketAppliesChildDiscount() {
        LocalDateTime now = LocalDateTime.of(2026, 6, 13, 10, 0);
        Trip trip = buildTrip(1L, new BigDecimal("70.00"), 42, now.plusHours(2));
        User seller = buildSeller(1L);
        CreateTicketRequest request = buildTicketRequest(1L, 1L, "Pasajero prueba", 7, "NINO");

        when(timeService.now()).thenReturn(now);
        when(tripRepository.findById(1L)).thenReturn(Optional.of(trip));
        when(ticketRepository.existsByTrip_IdAndSeatNumberAndStatus(1L, 7, "SOLD")).thenReturn(false);
        when(userRepository.findById(1L)).thenReturn(Optional.of(seller));
        when(ticketRepository.save(any(Ticket.class))).thenAnswer(invocation -> {
            Ticket ticket = invocation.getArgument(0);
            ReflectionTestUtils.setField(ticket, "id", 10L);
            return ticket;
        });

        TicketResponse response = ticketService.createTicket(request);

        assertThat(response.getPassengerType()).isEqualTo("NINO");
        assertThat(response.getDiscountPercentage()).isEqualByComparingTo("25.00");
        assertThat(response.getPrice()).isEqualByComparingTo("52.50");
        assertThat(response.getStatus()).isEqualTo("SOLD");
        assertThat(response.getSoldAt()).isEqualTo(now);
    }

    @Test
    void createTicketAppliesStudentDiscount() {
        LocalDateTime now = LocalDateTime.of(2026, 6, 13, 10, 0);
        Trip trip = buildTrip(1L, new BigDecimal("100.00"), 42, now.plusHours(2));
        User seller = buildSeller(1L);
        CreateTicketRequest request = buildTicketRequest(1L, 1L, "Estudiante prueba", 8, "ESTUDIANTE");

        when(timeService.now()).thenReturn(now);
        when(tripRepository.findById(1L)).thenReturn(Optional.of(trip));
        when(ticketRepository.existsByTrip_IdAndSeatNumberAndStatus(1L, 8, "SOLD")).thenReturn(false);
        when(userRepository.findById(1L)).thenReturn(Optional.of(seller));
        when(ticketRepository.save(any(Ticket.class))).thenAnswer(invocation -> {
            Ticket ticket = invocation.getArgument(0);
            ReflectionTestUtils.setField(ticket, "id", 11L);
            return ticket;
        });

        TicketResponse response = ticketService.createTicket(request);

        assertThat(response.getPassengerType()).isEqualTo("ESTUDIANTE");
        assertThat(response.getDiscountPercentage()).isEqualByComparingTo("35.00");
        assertThat(response.getPrice()).isEqualByComparingTo("65.00");
    }

    @Test
    void createTicketRejectsSeatOutsideBusCapacity() {
        LocalDateTime now = LocalDateTime.of(2026, 6, 13, 10, 0);
        Trip trip = buildTrip(1L, new BigDecimal("70.00"), 20, now.plusHours(2));
        CreateTicketRequest request = buildTicketRequest(1L, 1L, "Pasajero prueba", 21, "NORMAL");

        when(timeService.now()).thenReturn(now);
        when(tripRepository.findById(1L)).thenReturn(Optional.of(trip));

        assertThatThrownBy(() -> ticketService.createTicket(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Ese asiento no existe en este autobus. Elige un asiento del mapa");
    }

    private CreateTicketRequest buildTicketRequest(Long tripId, Long sellerUserId, String passengerName,
                                                   Integer seatNumber, String passengerType) {
        CreateTicketRequest request = new CreateTicketRequest();
        ReflectionTestUtils.setField(request, "tripId", tripId);
        ReflectionTestUtils.setField(request, "sellerUserId", sellerUserId);
        ReflectionTestUtils.setField(request, "passengerName", passengerName);
        ReflectionTestUtils.setField(request, "seatNumber", seatNumber);
        ReflectionTestUtils.setField(request, "passengerType", passengerType);
        return request;
    }

    private Trip buildTrip(Long id, BigDecimal basePrice, Integer capacity, LocalDateTime departureDateTime) {
        Route route = new Route();
        ReflectionTestUtils.setField(route, "id", 1L);
        route.setOrigin("Navojoa");
        route.setDestination("Hermosillo");
        route.setBasePrice(basePrice);
        route.setEstimatedDurationMinutes(240);

        Bus bus = new Bus();
        ReflectionTestUtils.setField(bus, "id", 1L);
        bus.setBusNumber("112");
        bus.setCapacity(capacity);

        Trip trip = new Trip();
        ReflectionTestUtils.setField(trip, "id", id);
        trip.setRoute(route);
        trip.setBus(bus);
        trip.setDepartureDateTime(departureDateTime);
        trip.setStatus("SCHEDULED");
        return trip;
    }

    private User buildSeller(Long id) {
        User seller = new User();
        ReflectionTestUtils.setField(seller, "id", id);
        seller.setFullName("Administrador MayitoBus");
        seller.setActive(true);
        return seller;
    }
}
