package com.trannam.example05.payloads;
import lombok.*;
@Data @NoArgsConstructor @AllArgsConstructor
public class CartItemDTO {
    private Long cartItemId;
    private CartDTO cart;
    private ProductDTO product;
    private Integer quantity;
    private double discount;
    private double productPrice;
}