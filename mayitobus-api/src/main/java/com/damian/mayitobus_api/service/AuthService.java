package com.damian.mayitobus_api.service;

import com.damian.mayitobus_api.dto.AuthResponse;
import com.damian.mayitobus_api.dto.LoginRequest;
import com.damian.mayitobus_api.entity.User;
import com.damian.mayitobus_api.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Correo o contrasena incorrectos"));

        if (!Boolean.TRUE.equals(user.getActive())) {
            throw new IllegalArgumentException("Este usuario esta desactivado. Pide a un administrador que lo active");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Correo o contrasena incorrectos");
        }

        String token = jwtService.generateToken(user);

        return new AuthResponse(
                token,
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole().getName()
        );
    }
}
