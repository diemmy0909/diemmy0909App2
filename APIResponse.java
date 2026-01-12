package com.trannam.example05.payloads;
import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor
public class APIResponse {
    private String message;
    private boolean status;
}