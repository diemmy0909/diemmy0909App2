package com.trannam.example05.payloads;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductDTO {

    private Long productId;
    private String productName;
    private String image;
    private String description;

    // ===== GIÁ =====
    private double price;
    private double discount;
    private double specialPrice;

    // ===== SỐ LƯỢNG (TÁCH RIÊNG) =====
    private Integer stockQuantity; // ✅ tồn kho thật (Product.quantity)
    private Integer cartQuantity;  // ✅ số lượng trong giỏ (CartItem.quantity)

    // ===== CATEGORY (React Admin dùng) =====
    private CategoryDTO category;
    
}
