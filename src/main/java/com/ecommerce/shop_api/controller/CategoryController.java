package com.ecommerce.shop_api.controller;

import com.ecommerce.shop_api.dto.request.CategoryRequest;
import com.ecommerce.shop_api.dto.response.ApiResponse;
import com.ecommerce.shop_api.dto.response.CategoryResponse;
import com.ecommerce.shop_api.service.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {
    // POST: Build Category
    private final CategoryService categoryService;
    @PostMapping
    public ResponseEntity<ApiResponse<CategoryResponse>> createCategory(
            @Valid @RequestBody CategoryRequest request) {
        CategoryResponse response = categoryService.createCategory(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("分類建立成功", response));
    }

    // GET: Get all Category
    @GetMapping
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getAllCategories() {
        List<CategoryResponse> responses = categoryService.getAllCategories();
        return ResponseEntity.ok(ApiResponse.success("查詢成功", responses));
    }
}
