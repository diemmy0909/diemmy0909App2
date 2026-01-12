package com.trannam.example05.service;

import com.trannam.example05.payloads.OrderDTO;
import com.trannam.example05.payloads.OrderResponse;
import java.util.List;

public interface OrderService {
    OrderDTO placeOrder(String emailId, Long cartId, String paymentMethod);
    OrderDTO getOrder(String emailId, Long orderId);
    List<OrderDTO> getOrdersByUser(String emailId);
    OrderResponse getAllOrders(Integer pageNumber, Integer pageSize, String sortBy, String sortOrder);
    OrderDTO updateOrder(String emailId, Long orderId, String orderStatus);
    
    // --- THÊM 2 HÀM NÀY CHO ADMIN ---
    OrderDTO getOrderById(Long orderId); 
    OrderDTO updateOrderStatus(Long orderId, String orderStatus);
}