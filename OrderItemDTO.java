package com.trannam.example05.payloads;
import lombok.*;
@Data @NoArgsConstructor @AllArgsConstructor
public class OrderItemDTO {
    private Long orderItemId;
    private ProductDTO product;
    private Integer quantity;
    private double discount;
    private double orderedProductPrice;
}