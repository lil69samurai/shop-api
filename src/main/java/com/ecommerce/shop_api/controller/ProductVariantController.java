package com.ecommerce.shop_api.controller;

import com.ecommerce.shop_api.dto.request.ProductOptionRequest;
import com.ecommerce.shop_api.dto.request.ProductVariantRequest;
import com.ecommerce.shop_api.dto.response.ApiResponse;
import com.ecommerce.shop_api.dto.response.ProductOptionResponse;
import com.ecommerce.shop_api.dto.response.ProductVariantResponse;
import com.ecommerce.shop_api.service.ProductVariantService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Product Variant (SKU / 規格) 管理 API
 *
 * 路徑統一掛在 /api/products/** 底下，自動套用 SecurityConfig：
 *   - GET 為公開（前台讀規格、價格、庫存）
 *   - POST/PUT/DELETE 為 ADMIN ONLY
 */
@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductVariantController {

    private final ProductVariantService variantService;

    // ============================================================
    // Options 屬性管理
    // ============================================================

    @GetMapping("/{productId}/options")
    public ResponseEntity<ApiResponse<List<ProductOptionResponse>>> getOptions(@PathVariable Long productId) {
        List<ProductOptionResponse> options = variantService.getOptions(productId);
        return ResponseEntity.ok(ApiResponse.success("Options retrieved", options));
    }

    @PostMapping("/{productId}/options")
    public ResponseEntity<ApiResponse<ProductOptionResponse>> createOption(
            @PathVariable Long productId,
            @Valid @RequestBody ProductOptionRequest request) {
        ProductOptionResponse response = variantService.createOption(productId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Option created", response));
    }

    @PutMapping("/options/{optionId}")
    public ResponseEntity<ApiResponse<ProductOptionResponse>> updateOption(
            @PathVariable Long optionId,
            @Valid @RequestBody ProductOptionRequest request) {
        ProductOptionResponse response = variantService.updateOption(optionId, request);
        return ResponseEntity.ok(ApiResponse.success("Option updated", response));
    }

    @DeleteMapping("/options/{optionId}")
    public ResponseEntity<ApiResponse<String>> deleteOption(@PathVariable Long optionId) {
        variantService.deleteOption(optionId);
        return ResponseEntity.ok(ApiResponse.success("Option deleted", null));
    }

    // ============================================================
    // Variants 規格管理
    // ============================================================

    @GetMapping("/{productId}/variants")
    public ResponseEntity<ApiResponse<List<ProductVariantResponse>>> getVariants(@PathVariable Long productId) {
        List<ProductVariantResponse> variants = variantService.getVariants(productId);
        return ResponseEntity.ok(ApiResponse.success("Variants retrieved", variants));
    }

    @PostMapping("/{productId}/variants")
    public ResponseEntity<ApiResponse<ProductVariantResponse>> createVariant(
            @PathVariable Long productId,
            @Valid @RequestBody ProductVariantRequest request) {
        ProductVariantResponse response = variantService.createVariant(productId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Variant created", response));
    }

    @PutMapping("/variants/{variantId}")
    public ResponseEntity<ApiResponse<ProductVariantResponse>> updateVariant(
            @PathVariable Long variantId,
            @Valid @RequestBody ProductVariantRequest request) {
        ProductVariantResponse response = variantService.updateVariant(variantId, request);
        return ResponseEntity.ok(ApiResponse.success("Variant updated", response));
    }

    @DeleteMapping("/variants/{variantId}")
    public ResponseEntity<ApiResponse<String>> deleteVariant(@PathVariable Long variantId) {
        variantService.deleteVariant(variantId);
        return ResponseEntity.ok(ApiResponse.success("Variant deleted", null));
    }
}
