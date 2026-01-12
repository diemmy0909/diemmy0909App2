package com.trannam.example05.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.trannam.example05.config.AppConstants;
import com.trannam.example05.payloads.UserDTO;
import com.trannam.example05.payloads.UserResponse;
import com.trannam.example05.service.UserService;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;

@RestController
@RequestMapping("/api")
@SecurityRequirement(name = "E-Commerce Application")
public class UserController {

    @Autowired
    private UserService userService;

    // ============ ADMIN ============

    @GetMapping("/admin/users")
    public ResponseEntity<UserResponse> getUsers(
            @RequestParam(defaultValue = AppConstants.PAGE_NUMBER) Integer pageNumber,
            @RequestParam(defaultValue = AppConstants.PAGE_SIZE) Integer pageSize,
            @RequestParam(defaultValue = AppConstants.SORT_USERS_BY) String sortBy,
            @RequestParam(defaultValue = AppConstants.SORT_DIR) String sortOrder) {

        return ResponseEntity.ok(
                userService.getAllUsers(pageNumber, pageSize, sortBy, sortOrder)
        );
    }

    @GetMapping("/public/users/{userId}")
    public ResponseEntity<UserDTO> getUser(@PathVariable Long userId) {
        return ResponseEntity.ok(userService.getUserById(userId));
    }

    @PutMapping("/public/users/{userId}")
    public ResponseEntity<UserDTO> updateUser(
            @RequestBody UserDTO userDTO,
            @PathVariable Long userId) {

        return ResponseEntity.ok(userService.updateUser(userId, userDTO));
    }

    @DeleteMapping("/admin/users/{userId}")
    public ResponseEntity<String> deleteUser(@PathVariable Long userId) {
        return ResponseEntity.ok(userService.deleteUser(userId));
    }
// Thêm vào UserController.java
@GetMapping("/public/users/email/{email}")
public ResponseEntity<UserDTO> getUserByEmail(@PathVariable String email) {
    return ResponseEntity.ok(userService.getUserByEmail(email)); 
    // Giả sử userService của bạn đã có hàm này
}
    
}
