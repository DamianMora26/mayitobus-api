package com.damian.mayitobus_api.repository;

import com.damian.mayitobus_api.entity.Trip;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface TripRepository extends JpaRepository<Trip, Long> {

    boolean existsByBus_IdAndDepartureDateTime(Long busId, LocalDateTime departureDateTime);

    List<Trip> findAllByOrderByDepartureDateTimeAsc();
}
