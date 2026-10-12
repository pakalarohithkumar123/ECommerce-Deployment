
package com.klu.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.klu.dto.AuthResponse;
import com.klu.dto.SigninRequest;
import com.klu.dto.SignupRequest;
import com.klu.service.UserService;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/signup")
    public ResponseEntity<String> signup(
            @RequestBody SignupRequest request) {

        String result = userService.signup(request);

        return ResponseEntity.ok(result);
    }

    @PostMapping("/signin")
    public ResponseEntity<AuthResponse> signin(
            @RequestBody SigninRequest request) {

        AuthResponse result = userService.signin(request);

        return ResponseEntity.ok(result);
    }
}

