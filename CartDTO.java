package com.trannam.example05.payloads;
import java.util.*;
import lombok.*;
@Data @NoArgsConstructor @AllArgsConstructor
public class CartDTO {
    private Long cartId;
    private Double totalPrice = 0.0;
    private List<ProductDTO> products = new ArrayList<>();
}