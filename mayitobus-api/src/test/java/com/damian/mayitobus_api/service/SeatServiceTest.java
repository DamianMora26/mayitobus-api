package com.damian.mayitobus_api.service;

import com.damian.mayitobus_api.dto.TripSeatsResponse;
import com.damian.mayitobus_api.entity.Bus;
import com.damian.mayitobus_api.entity.Ticket;
import com.damian.mayitobus_api.entity.Trip;
import com.damian.mayitobus_api.repository.TicketRepository;
import com.damian.mayitobus_api.repository.TripRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SeatServiceTest {

    @Mock
    private TripRepository tripRepository;

    @Mock
    private TicketRepository ticketRepository;

    @InjectMocks
    private SeatService seatService;

    @Test
    void getSeatsByTripMarksSoldAndAvailableSeats() {
        Trip trip = buildTrip(1L, 4);
        Ticket soldTicket = buildTicket(7L, 2, "Cliente Mayitos");

        when(tripRepository.findById(1L)).thenReturn(Optional.of(trip));
        when(ticketRepository.findByTrip_IdAndStatusOrderBySeatNumberAsc(1L, "SOLD"))
                .thenReturn(List.of(soldTicket));

        TripSeatsResponse response = seatService.getSeatsByTrip(1L);

        assertThat(response.getCapacity()).isEqualTo(4);
        assertThat(response.getSoldSeats()).isEqualTo(1);
        assertThat(response.getAvailableSeats()).isEqualTo(3);
        assertThat(response.getSeats()).hasSize(4);
        assertThat(response.getSeats().get(0).getStatus()).isEqualTo("AVAILABLE");
        assertThat(response.getSeats().get(1).getStatus()).isEqualTo("SOLD");
        assertThat(response.getSeats().get(1).getTicketId()).isEqualTo(7L);
        assertThat(response.getSeats().get(1).getPassengerName()).isEqualTo("Cliente Mayitos");
    }

    private Trip buildTrip(Long id, Integer capacity) {
        Bus bus = new Bus();
        bus.setCapacity(capacity);

        Trip trip = new Trip();
        ReflectionTestUtils.setField(trip, "id", id);
        trip.setBus(bus);
        return trip;
    }

    private Ticket buildTicket(Long id, Integer seatNumber, String passengerName) {
        Ticket ticket = new Ticket();
        ReflectionTestUtils.setField(ticket, "id", id);
        ticket.setSeatNumber(seatNumber);
        ticket.setPassengerName(passengerName);
        return ticket;
    }
}
