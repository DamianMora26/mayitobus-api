package com.damian.mayitobus_api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class LoginRequest {

    @NotBlank(message = "Escribe tu correo")
    @Email(message = "Escribe un correo valido")
    private String email;

    @NotBlank(message = "Escribe tu contrasena")
    private String password;

    public String getEmail() {
        return email;
    }

    public String getPassword() {
        return password;
    }
}
