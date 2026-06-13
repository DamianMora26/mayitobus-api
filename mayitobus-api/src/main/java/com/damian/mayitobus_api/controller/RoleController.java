package com.damian.mayitobus_api.controller;

import com.damian.mayitobus_api.entity.Role;
import com.damian.mayitobus_api.repository.RoleRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class RoleController {

    private final RoleRepository roleRepository;

    public RoleController(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }

    @GetMapping("/api/roles")
    public List<Role> getRoles() {
        return roleRepository.findAll();
    }
}