package com.trannam.example05.payloads;
import lombok.*;
@Data @NoArgsConstructor @AllArgsConstructor
public class PaymentDTO {
    private Long paymentId;
    private String paymentMethod;
}