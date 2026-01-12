package com.trannam.example05.service;

import java.util.List;
import com.trannam.example05.payloads.CartDTO;

public interface CartService {
    CartDTO addProductToCart(Long cartId, Long productId, Integer quantity);
    List<CartDTO> getAllCarts();
    CartDTO getCart(String emailId, Long cartId);
    
    // THÊM MỚI: Lấy giỏ hàng chỉ bằng Email (Dùng cho App di động)
    CartDTO getCartByEmail(String emailId); 
    
    CartDTO updateProductQuantityInCart(Long cartId, Long productId, Integer quantity);
    void updateProductInCarts(Long cartId, Long productId);
    String deleteProductFromCart(Long cartId, Long productId);
}