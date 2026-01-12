package com.trannam.example05.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import com.trannam.example05.config.AppConstants;
import com.trannam.example05.payloads.*;
import com.trannam.example05.service.OrderService;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;

@RestController
@RequestMapping("/api")
@SecurityRequirement(name = "E-Commerce Application")
public class OrderController {

    @Autowired
    private OrderService orderService;

    // ============ USER ============

    @PostMapping("/public/users/{emailId}/carts/{cartId}/payments/{paymentMethod}/order")
    public ResponseEntity<OrderDTO> orderProducts(
            @PathVariable String emailId,
            @PathVariable Long cartId,
            @PathVariable String paymentMethod) {

        OrderDTO order = orderService.placeOrder(emailId, cartId, paymentMethod);
        return ResponseEntity.status(HttpStatus.CREATED).body(order);
    }

    @GetMapping("/public/users/{emailId}/orders")
    public ResponseEntity<List<OrderDTO>> getOrdersByUser(@PathVariable String emailId) {
        return ResponseEntity.ok(orderService.getOrdersByUser(emailId));
    }

    @GetMapping("/public/users/{emailId}/orders/{orderId}")
    public ResponseEntity<OrderDTO> getOrderByUser(
            @PathVariable String emailId,
            @PathVariable Long orderId) {

        return ResponseEntity.ok(orderService.getOrder(emailId, orderId));
    }

    // ============ ADMIN ============

    @GetMapping("/admin/orders")
    public ResponseEntity<OrderResponse> getAllOrders(
            @RequestParam(defaultValue = AppConstants.PAGE_NUMBER) Integer pageNumber,
            @RequestParam(defaultValue = AppConstants.PAGE_SIZE) Integer pageSize,
            @RequestParam(defaultValue = AppConstants.SORT_ORDERS_BY) String sortBy,
            @RequestParam(defaultValue = AppConstants.SORT_DIR) String sortOrder) {

        return ResponseEntity.ok(
                orderService.getAllOrders(pageNumber, pageSize, sortBy, sortOrder)
        );
    }

    @GetMapping("/admin/orders/{orderId}")
    public ResponseEntity<OrderDTO> getOrderByIdForAdmin(@PathVariable Long orderId) {
        return ResponseEntity.ok(orderService.getOrderById(orderId));
    }

    @PutMapping("/admin/orders/{orderId}")
    public ResponseEntity<OrderDTO> updateOrderForAdmin(
            @PathVariable Long orderId,
            @RequestBody OrderDTO orderDTO) {

        return ResponseEntity.ok(
                orderService.updateOrderStatus(orderId, orderDTO.getOrderStatus())
        );
    }

    // ============ LEGACY ============

    @PutMapping("/admin/users/{emailId}/orders/{orderId}/orderStatus/{orderStatus}")
    public ResponseEntity<OrderDTO> updateOrderByUser(
            @PathVariable String emailId,
            @PathVariable Long orderId,
            @PathVariable String orderStatus) {

        return ResponseEntity.ok(
                orderService.updateOrder(emailId, orderId, orderStatus)
        );
    }
}
