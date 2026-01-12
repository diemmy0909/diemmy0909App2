package com.trannam.example05.controller;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.trannam.example05.config.AppConstants;
import com.trannam.example05.entity.Product;
import com.trannam.example05.payloads.ProductDTO;
import com.trannam.example05.payloads.ProductRequestDTO;
import com.trannam.example05.payloads.ProductResponse;
import com.trannam.example05.service.ProductService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api")
@SecurityRequirement(name = "E-Commerce Application")
@CrossOrigin(origins = "*")
public class ProductController {

    @Autowired 
    private ProductService productService;

    // ================= CREATE PRODUCT =================
@PostMapping("/admin/categories/{categoryId}/product")
public ResponseEntity<ProductDTO> addProduct(
        @Valid @RequestBody ProductRequestDTO request,
        @PathVariable Long categoryId) {

    ProductDTO savedProduct = productService.addProduct(categoryId, request);
    return new ResponseEntity<>(savedProduct, HttpStatus.CREATED);
}


    // ================= GET ONE =================
    @GetMapping("/public/products/{productId}")
    public ResponseEntity<ProductDTO> getOneProduct(@PathVariable Long productId) {
        return ResponseEntity.ok(productService.getProductById(productId));
    }

    // ================= GET ALL =================
    @GetMapping("/public/products")
    public ResponseEntity<ProductResponse> getAllProducts(
            @RequestParam(defaultValue = AppConstants.PAGE_NUMBER) Integer pageNumber,
            @RequestParam(defaultValue = AppConstants.PAGE_SIZE) Integer pageSize,
            @RequestParam(defaultValue = AppConstants.SORT_PRODUCTS_BY) String sortBy,
            @RequestParam(defaultValue = AppConstants.SORT_DIR) String sortOrder) {

        ProductResponse productResponse = productService.getAllProducts(
                pageNumber == 0 ? pageNumber : pageNumber - 1,
                pageSize,
                "id".equals(sortBy) ? "productId" : sortBy,
                sortOrder);

        return ResponseEntity.ok(productResponse);
    }

    // ================= IMAGE =================
    @GetMapping("/public/products/image/{fileName}")
    public ResponseEntity<InputStreamResource> getImage(@PathVariable String fileName)
            throws FileNotFoundException {

        InputStream imageStream = productService.getProductImage(fileName);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentDispositionFormData("inline", fileName);
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM); // 🔧 fix cứng PNG

        return new ResponseEntity<>(new InputStreamResource(imageStream), headers, HttpStatus.OK);
    }

    // ================= UPDATE PRODUCT =================
    @PutMapping("/admin/products/{productId}")
    public ResponseEntity<ProductDTO> updateProduct(
            @RequestBody Product product, 
            @PathVariable Long productId) {

        return ResponseEntity.ok(productService.updateProduct(productId, product));
    }

    // ================= UPDATE IMAGE =================
    @PutMapping(value = "/admin/products/{productId}/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProductDTO> updateProductImage(
            @PathVariable Long productId, 
            @RequestParam("image") MultipartFile image) throws IOException {

        return ResponseEntity.ok(productService.updateProductImage(productId, image));
    }

    // ================= DELETE =================
    @DeleteMapping("/admin/products/{productId}")
    public ResponseEntity<String> deleteProduct(@PathVariable Long productId) {
        return ResponseEntity.ok(productService.deleteProduct(productId));
    }
}
