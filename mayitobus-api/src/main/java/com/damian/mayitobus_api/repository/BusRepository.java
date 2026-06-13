package com.damian.mayitobus_api.repository;

import com.damian.mayitobus_api.entity.Bus;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BusRepository extends JpaRepository<Bus, Long> {

    boolean existsByBusNumber(String busNumber);

    boolean existsByLicensePlate(String licensePlate);
}