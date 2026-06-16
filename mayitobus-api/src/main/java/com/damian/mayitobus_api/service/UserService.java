package com.damian.mayitobus_api.service;

import com.damian.mayitobus_api.dto.CreateUserRequest;
import com.damian.mayitobus_api.dto.UserResponse;
import com.damian.mayitobus_api.entity.Role;
import com.damian.mayitobus_api.entity.User;
import com.damian.mayitobus_api.repository.RoleRepository;
import com.damian.mayitobus_api.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(
            UserRepository userRepository,
            RoleRepository roleRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User createUser(CreateUserRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Ya existe un usuario con ese correo");
        }

        Role role = roleRepository.findByName(request.getRoleName())
                .orElseThrow(() -> new IllegalArgumentException("Selecciona un rol valido para el usuario"));

        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(role);
        user.setActive(true);
        user.setCreatedAt(LocalDateTime.now());

        return userRepository.save(user);
    }

    public List<UserResponse> getUsers() {
        return userRepository.findAll()
                .stream()
                .map(UserResponse::new)
                .toList();
    }

    public UserResponse updateActive(Long userId, Boolean active) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("No se encontro ese usuario. Actualiza la lista e intenta de nuevo"));

        user.setActive(active);

        return new UserResponse(userRepository.save(user));
    }
}
