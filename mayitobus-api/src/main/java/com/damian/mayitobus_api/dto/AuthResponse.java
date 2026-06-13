package com.damian.mayitobus_api.dto;

public class AuthResponse {

    private String token;
    private String tokenType;
    private Long userId;
    private String fullName;
    private String email;
    private String roleName;

    public AuthResponse(String token, Long userId, String fullName, String email, String roleName) {
        this.token = token;
        this.tokenType = "Bearer";
        this.userId = userId;
        this.fullName = fullName;
        this.email = email;
        this.roleName = roleName;
    }

    public String getToken() {
        return token;
    }

    public String getTokenType() {
        return tokenType;
    }

    public Long getUserId() {
        return userId;
    }

    public String getFullName() {
        return fullName;
    }

    public String getEmail() {
        return email;
    }

    public String getRoleName() {
        return roleName;
    }
}
