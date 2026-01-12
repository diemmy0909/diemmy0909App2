package com.trannam.example05.repository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.trannam.example05.entity.Product;

@Repository
public interface ProductRepo extends JpaRepository<Product, Long> {
    Page<Product> findByProductNameLike(String keyword, Pageable pageDetails);
    // Thêm phương thức này cho ServiceImpl
    Page<Product> findByCategoryCategoryId(Long categoryId, Pageable pageable);
}