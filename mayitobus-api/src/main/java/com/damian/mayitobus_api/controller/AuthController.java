package com.damian.mayitobus_api.controller;

import com.damian.mayitobus_api.dto.AuthResponse;
import com.damian.mayitobus_api.dto.LoginRequest;
import com.damian.mayitobus_api.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }
}
