package com.trannam.example05.payloads;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ProductRequestDTO {

    private String productName;
    private String description;
    private Double price;
    private Double discount;

    @NotNull(message = "Stock quantity is required")
    private Integer stockQuantity;
}
