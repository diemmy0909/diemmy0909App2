package com.trannam.example05.payloads;
import lombok.*;
@Data @NoArgsConstructor @AllArgsConstructor
public class CategoryDTO {
    private Long categoryId;
    private String categoryName;
}