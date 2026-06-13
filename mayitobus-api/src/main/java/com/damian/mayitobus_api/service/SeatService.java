package com.damian.mayitobus_api.service;

import com.damian.mayitobus_api.dto.SeatResponse;
import com.damian.mayitobus_api.dto.TripSeatsResponse;
import com.damian.mayitobus_api.entity.Ticket;
import com.damian.mayitobus_api.entity.Trip;
import com.damian.mayitobus_api.repository.TicketRepository;
import com.damian.mayitobus_api.repository.TripRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.IntStream;

@Service
public class SeatService {

    private final TripRepository tripRepository;
    private final TicketRepository ticketRepository;

    public SeatService(TripRepository tripRepository, TicketRepository ticketRepository) {
        this.tripRepository = tripRepository;
        this.ticketRepository = ticketRepository;
    }

    @Transactional(readOnly = true)
    public TripSeatsResponse getSeatsByTrip(Long tripId) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new IllegalArgumentException("El viaje no existe"));

        List<Ticket> soldTickets = ticketRepository.findByTrip_IdAndStatusOrderBySeatNumberAsc(tripId, "SOLD");
        Map<Integer, Ticket> ticketsBySeat = new HashMap<>();

        for (Ticket ticket : soldTickets) {
            ticketsBySeat.put(ticket.getSeatNumber(), ticket);
        }

        List<SeatResponse> seats = IntStream.rangeClosed(1, trip.getBus().getCapacity())
                .mapToObj(seatNumber -> {
                    Ticket ticket = ticketsBySeat.get(seatNumber);

                    if (ticket == null) {
                        return new SeatResponse(seatNumber, "AVAILABLE", null, null);
                    }

                    return new SeatResponse(seatNumber, "SOLD", ticket.getId(), ticket.getPassengerName());
                })
                .toList();

        return new TripSeatsResponse(trip.getId(), trip.getBus().getCapacity(), soldTickets.size(), seats);
    }
}
