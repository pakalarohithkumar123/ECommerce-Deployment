package com.klu.dto;
import com.klu.model.Role;

public class AuthResponse {
    private Long userId;
    private String name;
    private String email;
    private Role role;
    private String message;

    public AuthResponse(Long userId,String name,String email,Role role,String message) {
        this.userId = userId;
        this.name = name;
        this.email = email;
        this.role = role;
        this.message = message;
    }
    public Long getUserId() {
        return userId;
    }
    public String getName() {
        return name;
    }
    public String getEmail() {
        return email;
    }
    public Role getRole() {
        return role;
    }
    public String getMessage() {
        return message;
    }
}
