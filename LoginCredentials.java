package com.trannam.example05.payloads;
import jakarta.persistence.Column;
import jakarta.validation.constraints.Email;
import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor
public class LoginCredentials {
    @Email @Column(unique = true, nullable = false)
    private String email;
    private String password;
}