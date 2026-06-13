package com.damian.mayitobus_api.service;

import com.damian.mayitobus_api.dto.BusResponse;
import com.damian.mayitobus_api.dto.CreateBusRequest;
import com.damian.mayitobus_api.entity.Bus;
import com.damian.mayitobus_api.repository.BusRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class BusService {

    private final BusRepository busRepository;

    public BusService(BusRepository busRepository) {
        this.busRepository = busRepository;
    }

    public BusResponse createBus(CreateBusRequest request) {
        if (busRepository.existsByBusNumber(request.getBusNumber())) {
            throw new IllegalArgumentException("El número de autobús ya está registrado");
        }

        if (busRepository.existsByLicensePlate(request.getLicensePlate())) {
            throw new IllegalArgumentException("Las placas ya están registradas");
        }

        Bus bus = new Bus();
        bus.setBusNumber(request.getBusNumber());
        bus.setLicensePlate(request.getLicensePlate());
        bus.setModel(request.getModel());
        bus.setCapacity(request.getCapacity());
        bus.setStatus("ACTIVE");
        bus.setCreatedAt(LocalDateTime.now());

        return new BusResponse(busRepository.save(bus));
    }

    public List<BusResponse> getBuses() {
        return busRepository.findAll()
                .stream()
                .map(BusResponse::new)
                .toList();
    }

    public BusResponse updateStatus(Long busId, String status) {
        Bus bus = busRepository.findById(busId)
                .orElseThrow(() -> new IllegalArgumentException("El autobus no existe"));

        bus.setStatus(status);

        return new BusResponse(busRepository.save(bus));
    }
}
