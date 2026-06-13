package com.damian.mayitobus_api.repository;

import com.damian.mayitobus_api.entity.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface TicketRepository extends JpaRepository<Ticket, Long> {

    boolean existsByTrip_IdAndSeatNumberAndStatus(Long tripId, Integer seatNumber, String status);

    List<Ticket> findAllByOrderBySoldAtDesc();

    List<Ticket> findByTrip_IdOrderBySeatNumberAsc(Long tripId);

    List<Ticket> findByTrip_IdAndStatusOrderBySeatNumberAsc(Long tripId, String status);

    List<Ticket> findBySoldAtBetweenOrderBySoldAtAsc(LocalDateTime start, LocalDateTime end);

    List<Ticket> findByCancelledAtBetweenOrderByCancelledAtAsc(LocalDateTime start, LocalDateTime end);
}
