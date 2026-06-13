package com.damian.mayitobus_api.repository;

import com.damian.mayitobus_api.entity.Route;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RouteRepository extends JpaRepository<Route, Long> {

    boolean existsByOriginIgnoreCaseAndDestinationIgnoreCase(String origin, String destination);
}
