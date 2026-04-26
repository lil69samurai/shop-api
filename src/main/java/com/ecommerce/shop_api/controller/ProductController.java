package com.ecommerce.shop_api.controller;

import com.ecommerce.shop_api.dto.request.ProductRequest;
import com.ecommerce.shop_api.dto.response.ApiResponse;
import com.ecommerce.shop_api.dto.response.ProductResponse;
import com.ecommerce.shop_api.service.FileStorageService;
import com.ecommerce.shop_api.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;
    private final FileStorageService fileStorageService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<ProductResponse>> createProduct(
            @RequestParam String name,
            @RequestParam(required = false) String description,
            @RequestParam BigDecimal price,
            @RequestParam Integer stock,
            @RequestParam Long categoryId,
            @RequestPart(value = "image", required = false) MultipartFile imageFile) {

        try {
            ProductRequest request = new ProductRequest();
            request.setName(name);
            request.setDescription(description);
            request.setPrice(price);
            request.setStock(stock);
            request.setCategoryId(categoryId);

            if (imageFile != null && !imageFile.isEmpty()) {
                String imageUrl = fileStorageService.saveFile(imageFile);
                request.setImageUrl(imageUrl);
            }

            ProductResponse response = productService.createProduct(request);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Product created successfully", response));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("图片上传失败: " + e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<ProductResponse>>> getAllProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long categoryId) {

        Sort sort = sortDir.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(page, size, sort);
        Page<ProductResponse> responses = productService.searchProducts(keyword, categoryId, pageable);

        return ResponseEntity.ok(ApiResponse.success("Search successful", responses));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductResponse>> getProductById(@PathVariable Long id) {
        ProductResponse response = productService.getProductById(id);
        return ResponseEntity.ok(ApiResponse.success("Query successful", response));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<ProductResponse>> updateProduct(
            @PathVariable Long id,
            @RequestParam String name,
            @RequestParam(required = false) String description,
            @RequestParam BigDecimal price,
            @RequestParam Integer stock,
            @RequestParam Long categoryId,
            @RequestPart(value = "image", required = false) MultipartFile imageFile) {

        try {
            ProductResponse oldProduct = productService.getProductById(id);

            ProductRequest request = new ProductRequest();
            request.setName(name);
            request.setDescription(description);
            request.setPrice(price);
            request.setStock(stock);
            request.setCategoryId(categoryId);
            request.setImageUrl(oldProduct.getImageUrl());

            if (imageFile != null && !imageFile.isEmpty()) {
                if (oldProduct.getImageUrl() != null && !oldProduct.getImageUrl().isBlank()) {
                    fileStorageService.deleteFile(oldProduct.getImageUrl());
                }

                String newImageUrl = fileStorageService.saveFile(imageFile);
                request.setImageUrl(newImageUrl);
            }

            ProductResponse response = productService.updateProduct(id, request);
            return ResponseEntity.ok(ApiResponse.success("Product updated successfully", response));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Image upload failed: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteProduct(@PathVariable Long id) {
        ProductResponse oldProduct = productService.getProductById(id);

        if (oldProduct.getImageUrl() != null && !oldProduct.getImageUrl().isBlank()) {
            fileStorageService.deleteFile(oldProduct.getImageUrl());
        }

        productService.deleteProduct(id);
        return ResponseEntity.ok(ApiResponse.success("Product deleted successfully", null));
    }

    @PostMapping(value = "/{id}/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<ProductResponse>> uploadProductImage(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {

        try {
            ProductResponse oldProduct = productService.getProductById(id);

            if (oldProduct.getImageUrl() != null && !oldProduct.getImageUrl().isBlank()) {
                fileStorageService.deleteFile(oldProduct.getImageUrl());
            }

            String imageUrl = fileStorageService.saveFile(file);
            ProductResponse response = productService.updateProductImage(id, imageUrl);

            return ResponseEntity.ok(ApiResponse.success("Image uploaded successfully", response));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Image upload failed: " + e.getMessage()));
        }
    }
}