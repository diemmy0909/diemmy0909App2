package com.trannam.example05.config;

public class AppConstants {
    // Các biến phân trang (Bài B5 yêu cầu PAGE_SIZE = 5)
    public static final String PAGE_NUMBER = "0";
    public static final String PAGE_SIZE = "5"; 
    
    // Các biến sắp xếp (Đây là phần bạn đang thiếu gây lỗi đỏ)
    public static final String SORT_CATEGORIES_BY = "categoryId";
    public static final String SORT_PRODUCTS_BY = "productId";
    public static final String SORT_USERS_BY = "userId";
    public static final String SORT_ORDERS_BY = "totalAmount";
    public static final String SORT_DIR = "asc";

    // Các biến hệ thống
    public static final Long ADMIN_ID = 101L;
    public static final Long USER_ID = 102L;
    public static final long JWT_TOKEN_VALIDITY = 5 * 60 * 60;

    // Đường dẫn cho phép truy cập không cần mật khẩu
    public static final String[] PUBLIC_URLS = { 
        "/v3/api-docs/**", 
        "/swagger-ui/**", 
        "/api/register/**", 
        "/api/login",
        "/api/public/products/image/**" // Cho phép xem ảnh
    };

    public static final String[] USER_URLS = { "/api/public/**" };
    public static final String[] ADMIN_URLS = { "/api/admin/**" };
}