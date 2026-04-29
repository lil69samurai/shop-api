package com.ecommerce.shop_api.controller;

import com.ecommerce.shop_api.dto.request.ProductRequest;
import com.ecommerce.shop_api.dto.response.ApiResponse;
import com.ecommerce.shop_api.dto.response.ProductResponse;
import com.ecommerce.shop_api.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.ecommerce.shop_api.service.FileStorageService;
import com.ecommerce.shop_api.repository.ProductImageRepository;
import com.ecommerce.shop_api.entity.ProductImage;
import com.ecommerce.shop_api.repository.ProductRepository;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.MediaType;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;
    private final FileStorageService fileStorageService;
    private final ProductImageRepository productImageRepository;
    private final ProductRepository productRepository;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<ProductResponse>> createProduct(
            @RequestPart("product") @Valid ProductRequest request,
            @RequestPart(value = "image", required = false) MultipartFile imageFile) {

        if (imageFile != null && !imageFile.isEmpty()) {
            try {
                String imageUrl = fileStorageService.saveFile(imageFile);
                request.setImageUrl(imageUrl);
            } catch (Exception e) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(ApiResponse.error("Image upload failed: " + e.getMessage()));
            }
        }

        ProductResponse response = productService.createProduct(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Product built successfully", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<ProductResponse>>> getAllProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice) {

        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<ProductResponse> responses = productService.searchProducts(keyword, categoryId, minPrice, maxPrice, pageable);
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
            @RequestPart("product") @Valid ProductRequest request,
            @RequestPart(value = "image", required = false) MultipartFile imageFile) {

        if (imageFile != null && !imageFile.isEmpty()) {
            try {
                ProductResponse oldProduct = productService.getProductById(id);
                if (oldProduct.getImageUrl() != null) {
                    fileStorageService.deleteFile(oldProduct.getImageUrl());
                }
                String newImageUrl = fileStorageService.saveFile(imageFile);
                request.setImageUrl(newImageUrl);
            } catch (Exception e) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(ApiResponse.error("Image upload failed: " + e.getMessage()));
            }
        }

        ProductResponse response = productService.updateProduct(id, request);
        return ResponseEntity.ok(ApiResponse.success("Product updated successfully", response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok(ApiResponse.success("Product deleted successfully", null));
    }

    @PostMapping("/{id}/image")
    public ResponseEntity<ApiResponse<ProductResponse>> uploadProductImage(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {

        String imageUrl = fileStorageService.saveFile(file);
        ProductResponse response = productService.updateProductImage(id, imageUrl);
        return ResponseEntity.ok(ApiResponse.success("Image uploaded successfully", response));
    }

    @PostMapping("/{id}/images")
    public ResponseEntity<ApiResponse<ProductResponse>> uploadProductImages(
            @PathVariable Long id,
            @RequestParam("files") List<MultipartFile> files) {

        com.ecommerce.shop_api.entity.Product product = productRepository.findById(id)
                .orElseThrow(() -> new com.ecommerce.shop_api.exception.ResourceNotFoundException("Product not found: " + id));

        int currentMax = productImageRepository.findByProductIdOrderBySortOrderAsc(id).size();
        for (int i = 0; i < files.size(); i++) {
            String imageUrl = fileStorageService.saveFile(files.get(i));
            ProductImage img = ProductImage.builder()
                    .product(product)
                    .imageUrl(imageUrl)
                    .sortOrder(currentMax + i)
                    .build();
            product.getImages().add(img);
        }

        if (product.getImageUrl() == null && !product.getImages().isEmpty()) {
            product.setImageUrl(product.getImages().get(0).getImageUrl());
        }

        productRepository.save(product);
        productService.normalizeImageSortOrder(id);
        ProductResponse response = productService.getProductById(id);
        return ResponseEntity.ok(ApiResponse.success("Images uploaded successfully", response));
    }

    @PatchMapping("/{id}/images/reorder")
    public ResponseEntity<ApiResponse<ProductResponse>> reorderProductImages(
            @PathVariable Long id,
            @RequestBody Map<String, List<Long>> payload) {
        List<Long> imageIds = payload.get("imageIds");
        if (imageIds == null) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("imageIds is required"));
        }
        ProductResponse response = productService.reorderProductImages(id, imageIds);
        return ResponseEntity.ok(ApiResponse.success("Images reordered successfully", response));
    }

    @DeleteMapping("/images/{imageId}")
    public ResponseEntity<ApiResponse<ProductResponse>> deleteProductImage(@PathVariable Long imageId) {
        ProductImage img = productImageRepository.findById(imageId)
                .orElseThrow(() -> new com.ecommerce.shop_api.exception.ResourceNotFoundException("Image not found: " + imageId));
        try {
            fileStorageService.deleteFile(img.getImageUrl());
        } catch (Exception e) {
        }
        ProductResponse response = productService.deleteProductImageAndReorder(imageId);
        return ResponseEntity.ok(ApiResponse.success("Image deleted", response));
    }
}
