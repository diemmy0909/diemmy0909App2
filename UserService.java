package com.trannam.example05.service;
import com.trannam.example05.payloads.*;

public interface UserService {
    UserDTO registerUser(UserDTO userDTO);
    UserResponse getAllUsers(Integer pageNumber, Integer pageSize, String sortBy, String sortOrder);
    UserDTO getUserById(Long userId);
    UserDTO updateUser(Long userId, UserDTO userDTO);
    String deleteUser(Long userId);
    // Trong file UserService.java
UserDTO getUserByEmail(String email);
}