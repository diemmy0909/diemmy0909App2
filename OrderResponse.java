package com.trannam.example05.payloads;
import java.util.List;
import lombok.*;
@Data @NoArgsConstructor @AllArgsConstructor
public class OrderResponse {
    private List<OrderDTO> content;
    private Integer pageNumber;
    private Integer pageSize;
    private Long totalElements;
    private Integer totalPages;
    private boolean lastPage;
}