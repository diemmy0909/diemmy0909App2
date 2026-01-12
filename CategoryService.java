package com.trannam.example05.service;
import com.trannam.example05.entity.Category;
import com.trannam.example05.payloads.*;

public interface CategoryService {
    CategoryDTO createCategory(Category category);
    CategoryResponse getCategories(Integer pageNumber, Integer pageSize, String sortBy, String sortOrder);
    CategoryDTO updateCategory(Category category, Long categoryId);
    String deleteCategory(Long categoryId);
    // Thêm hàm này nếu cần dùng trong CategoryController
    CategoryDTO getCategoryById(Long categoryId);
}