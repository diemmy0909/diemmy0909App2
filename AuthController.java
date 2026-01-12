package com.trannam.example05.controller;

import java.util.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
// Đã xóa import PasswordEncoder thừa
import org.springframework.web.bind.annotation.*;
import com.trannam.example05.exceptions.UserNotFoundException;
import com.trannam.example05.payloads.LoginCredentials;
import com.trannam.example05.payloads.UserDTO;
import com.trannam.example05.security.JWTUtil;
import com.trannam.example05.service.UserService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api")
@SecurityRequirement(name = "E-Commerce Application")
public class AuthController {
    @Autowired private UserService userService;
    @Autowired private JWTUtil jwtUtil;
    @Autowired private AuthenticationManager authenticationManager;
    
    // Đã xóa: @Autowired private PasswordEncoder passwordEncoder; (Không cần dùng ở Controller nữa)

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> registerHandler(@Valid @RequestBody UserDTO user) throws UserNotFoundException {
        // --- SỬA LỖI Ở ĐÂY ---
        // Đã XÓA 2 dòng mã hóa mật khẩu tại đây.
        // Để nguyên mật khẩu thô (raw) chuyển xuống cho UserService xử lý.
        
        UserDTO userDTO = userService.registerUser(user);
        
        String token = jwtUtil.generateToken(userDTO.getEmail());
        return new ResponseEntity<>(Collections.singletonMap("jwt-token", token), HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public Map<String, Object> loginHandler(@Valid @RequestBody LoginCredentials credentials) {
        UsernamePasswordAuthenticationToken authCredentials = new UsernamePasswordAuthenticationToken(
            credentials.getEmail(), credentials.getPassword());
            
        authenticationManager.authenticate(authCredentials);
        
        String token = jwtUtil.generateToken(credentials.getEmail());
        return Collections.singletonMap("jwt-token", token);
    }
}