package com.trannam.example05.payloads;
import java.util.*;
import java.time.LocalDate;
import lombok.*;
@Data @NoArgsConstructor @AllArgsConstructor
public class OrderDTO {
    private Long orderId;
    private String email;
    private List<OrderItemDTO> orderItems = new ArrayList<>();
    private LocalDate orderDate;
    private PaymentDTO payment;
    private Double totalAmount;
    private String orderStatus;
}