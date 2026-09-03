package com.damian.mayitobus_api.service;

import com.damian.mayitobus_api.dto.AuthResponse;
import com.damian.mayitobus_api.dto.LoginRequest;
import com.damian.mayitobus_api.entity.User;
import com.damian.mayitobus_api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        
        // 1. Buscar usuario
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadCredentialsException("Correo o contraseña incorrectos"));

        // 2. Validar credenciales primero
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BadCredentialsException("Correo o contraseña incorrectos");
        }

        // 3. Validar si está activo
        if (!Boolean.TRUE.equals(user.getActive())) {
            throw new DisabledException("Este usuario está desactivado. Contacte a un administrador.");
        }

        // 4. Generar Token
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
