package com.trannam.example05.service;
import java.io.*;
import org.springframework.web.multipart.MultipartFile;
import com.trannam.example05.entity.Product;
import com.trannam.example05.payloads.*;

public interface ProductService {
ProductDTO addProduct(Long categoryId, ProductRequestDTO request);
    ProductResponse getAllProducts(Integer pageNumber, Integer pageSize, String sortBy, String sortOrder);
    ProductResponse searchByCategory(Long categoryId, Integer pageNumber, Integer pageSize, String sortBy, String sortOrder);
    ProductDTO updateProduct(Long productId, Product product);
    ProductDTO updateProductImage(Long productId, MultipartFile image) throws IOException;
    InputStream getProductImage(String fileName) throws FileNotFoundException;
    ProductResponse searchProductByKeyword(String keyword, Integer pageNumber, Integer pageSize, String sortBy, String sortOrder);
    String deleteProduct(Long productId);
    ProductDTO getProductById(Long productId);
}