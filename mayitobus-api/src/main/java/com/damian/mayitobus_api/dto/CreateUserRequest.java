package com.damian.mayitobus_api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CreateUserRequest {

    @NotBlank(message = "Escribe el nombre completo del usuario")
    @Size(max = 120, message = "El nombre no debe pasar de 120 caracteres")
    private String fullName;

    @NotBlank(message = "Escribe el correo del usuario")
    @Email(message = "Escribe un correo valido")
    @Size(max = 120, message = "El correo no debe pasar de 120 caracteres")
    private String email;

    @Size(max = 20, message = "El telefono no debe pasar de 20 caracteres")
    private String phone;

    @NotBlank(message = "Escribe una contrasena para el usuario")
    @Size(min = 6, max = 100, message = "La contrasena debe tener entre 6 y 100 caracteres")
    private String password;

    @NotBlank(message = "Selecciona el rol del usuario")
    private String roleName;

    public String getFullName() {
        return fullName;
    }

    public String getEmail() {
        return email;
    }

    public String getPhone() {
        return phone;
    }

    public String getPassword() {
        return password;
    }

    public String getRoleName() {
        return roleName;
    }
}
