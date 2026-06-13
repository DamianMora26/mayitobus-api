package com.damian.mayitobus_api.service;

import com.damian.mayitobus_api.dto.CreateTicketRequest;
import com.damian.mayitobus_api.dto.TicketResponse;
import com.damian.mayitobus_api.entity.Ticket;
import com.damian.mayitobus_api.entity.Trip;
import com.damian.mayitobus_api.entity.User;
import com.damian.mayitobus_api.repository.TicketRepository;
import com.damian.mayitobus_api.repository.TripRepository;
import com.damian.mayitobus_api.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
public class TicketService {

    private final TicketRepository ticketRepository;
    private final TripRepository tripRepository;
    private final UserRepository userRepository;
    private final TimeService timeService;

    public TicketService(TicketRepository ticketRepository, TripRepository tripRepository, UserRepository userRepository, TimeService timeService) {
        this.ticketRepository = ticketRepository;
        this.tripRepository = tripRepository;
        this.userRepository = userRepository;
        this.timeService = timeService;
    }

    @Transactional
    public TicketResponse createTicket(CreateTicketRequest request) {
        Trip trip = tripRepository.findById(request.getTripId())
                .orElseThrow(() -> new IllegalArgumentException("El viaje no existe"));

        if (!"SCHEDULED".equalsIgnoreCase(trip.getStatus())) {
            throw new IllegalArgumentException("El viaje no esta disponible para venta");
        }

        if (!trip.getDepartureDateTime().isAfter(timeService.now())) {
            throw new IllegalArgumentException("No se pueden vender boletos para un viaje que ya salio");
        }

        if (request.getSeatNumber() > trip.getBus().getCapacity()) {
            throw new IllegalArgumentException("El asiento excede la capacidad del autobus");
        }

        if (ticketRepository.existsByTrip_IdAndSeatNumberAndStatus(trip.getId(), request.getSeatNumber(), "SOLD")) {
            throw new IllegalArgumentException("El asiento ya esta vendido para este viaje");
        }

        User seller = userRepository.findById(request.getSellerUserId())
                .orElseThrow(() -> new IllegalArgumentException("El vendedor no existe"));

        if (!Boolean.TRUE.equals(seller.getActive())) {
            throw new IllegalArgumentException("El vendedor no esta activo");
        }

        Ticket ticket = new Ticket();
        ticket.setTrip(trip);
        ticket.setSeller(seller);
        ticket.setPassengerName(request.getPassengerName());
        ticket.setSeatNumber(request.getSeatNumber());
        ticket.setPassengerType(normalizePassengerType(request.getPassengerType()));
        ticket.setDiscountPercentage(getDiscountPercentage(ticket.getPassengerType()));
        ticket.setPrice(calculateFinalPrice(trip.getRoute().getBasePrice(), ticket.getDiscountPercentage()));
        ticket.setStatus("SOLD");
        ticket.setSoldAt(timeService.now());

        return new TicketResponse(ticketRepository.save(ticket));
    }

    private String normalizePassengerType(String passengerType) {
        String normalized = passengerType.trim().toUpperCase();

        return switch (normalized) {
            case "NORMAL", "ADULTO_MAYOR", "NINO", "DISCAPACITADO" -> normalized;
            default -> throw new IllegalArgumentException("Tipo de pasajero no valido");
        };
    }

    private BigDecimal getDiscountPercentage(String passengerType) {
        return switch (passengerType) {
            case "NINO" -> new BigDecimal("25.00");
            case "ADULTO_MAYOR", "DISCAPACITADO" -> new BigDecimal("50.00");
            default -> BigDecimal.ZERO;
        };
    }

    private BigDecimal calculateFinalPrice(BigDecimal basePrice, BigDecimal discountPercentage) {
        BigDecimal discount = basePrice.multiply(discountPercentage)
                .divide(new BigDecimal("100.00"), 2, RoundingMode.HALF_UP);

        return basePrice.subtract(discount).setScale(2, RoundingMode.HALF_UP);
    }

    @Transactional(readOnly = true)
    public List<TicketResponse> getTickets() {
        return ticketRepository.findAllByOrderBySoldAtDesc()
                .stream()
                .map(TicketResponse::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<TicketResponse> getTicketsByTrip(Long tripId) {
        if (!tripRepository.existsById(tripId)) {
            throw new IllegalArgumentException("El viaje no existe");
        }

        return ticketRepository.findByTrip_IdOrderBySeatNumberAsc(tripId)
                .stream()
                .map(TicketResponse::new)
                .toList();
    }

    @Transactional
    public TicketResponse cancelTicket(Long ticketId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("El boleto no existe"));

        if (!"SOLD".equalsIgnoreCase(ticket.getStatus())) {
            throw new IllegalArgumentException("El boleto no esta vendido");
        }

        if (!ticket.getTrip().getDepartureDateTime().isAfter(timeService.now())) {
            throw new IllegalArgumentException("No se puede cancelar un boleto de un viaje que ya salio");
        }

        ticket.setStatus("CANCELLED");
        ticket.setCancelledAt(timeService.now());

        return new TicketResponse(ticketRepository.save(ticket));
    }
}
