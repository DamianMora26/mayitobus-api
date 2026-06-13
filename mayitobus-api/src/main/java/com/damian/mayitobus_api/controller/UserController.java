package com.damian.mayitobus_api.controller;

import com.damian.mayitobus_api.dto.CreateUserRequest;
import com.damian.mayitobus_api.dto.UserResponse;
import com.damian.mayitobus_api.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponse createUser(@Valid @RequestBody CreateUserRequest request) {
        return new UserResponse(userService.createUser(request));
    }

    @GetMapping
    public java.util.List<UserResponse> getUsers() {
        return userService.getUsers();
    }

    @PatchMapping("/{userId}/deactivate")
    public UserResponse deactivateUser(@PathVariable Long userId) {
        return userService.updateActive(userId, false);
    }

    @PatchMapping("/{userId}/activate")
    public UserResponse activateUser(@PathVariable Long userId) {
        return userService.updateActive(userId, true);
    }
}

