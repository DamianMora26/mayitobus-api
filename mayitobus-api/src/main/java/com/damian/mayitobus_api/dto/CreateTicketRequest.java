package com.damian.mayitobus_api.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class CreateTicketRequest {

    @NotNull(message = "Selecciona un viaje programado antes de vender el boleto")
    private Long tripId;

    @NotNull(message = "No se encontro el usuario vendedor. Vuelve a iniciar sesion")
    private Long sellerUserId;

    @NotBlank(message = "Escribe el nombre del pasajero")
    @Size(max = 120, message = "El nombre del pasajero no debe pasar de 120 caracteres")
    private String passengerName;

    @NotNull(message = "Selecciona un asiento disponible antes de vender el boleto")
    @Min(value = 1, message = "Selecciona un asiento valido antes de vender el boleto")
    private Integer seatNumber;

    @NotBlank(message = "Selecciona la categoria del pasajero")
    private String passengerType;

    public Long getTripId() {
        return tripId;
    }

    public Long getSellerUserId() {
        return sellerUserId;
    }

    public String getPassengerName() {
        return passengerName;
    }

    public Integer getSeatNumber() {
        return seatNumber;
    }

    public String getPassengerType() {
        return passengerType;
    }
}
