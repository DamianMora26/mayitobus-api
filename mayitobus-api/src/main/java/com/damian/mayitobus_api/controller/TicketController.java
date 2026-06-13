package com.damian.mayitobus_api.controller;

import com.damian.mayitobus_api.dto.CreateTicketRequest;
import com.damian.mayitobus_api.dto.TicketResponse;
import com.damian.mayitobus_api.service.TicketService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class TicketController {

    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @PostMapping("/api/tickets")
    @ResponseStatus(HttpStatus.CREATED)
    public TicketResponse createTicket(@Valid @RequestBody CreateTicketRequest request) {
        return ticketService.createTicket(request);
    }

    @GetMapping("/api/tickets")
    public List<TicketResponse> getTickets() {
        return ticketService.getTickets();
    }

    @GetMapping("/api/trips/{tripId}/tickets")
    public List<TicketResponse> getTicketsByTrip(@PathVariable Long tripId) {
        return ticketService.getTicketsByTrip(tripId);
    }

    @PatchMapping("/api/tickets/{ticketId}/cancel")
    public TicketResponse cancelTicket(@PathVariable Long ticketId) {
        return ticketService.cancelTicket(ticketId);
    }
}
