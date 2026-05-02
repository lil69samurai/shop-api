package com.ecommerce.shop_api.service;

import com.ecommerce.shop_api.dto.request.ProductOptionRequest;
import com.ecommerce.shop_api.dto.request.ProductVariantRequest;
import com.ecommerce.shop_api.dto.response.ProductOptionResponse;
import com.ecommerce.shop_api.dto.response.ProductVariantResponse;
import com.ecommerce.shop_api.entity.Product;
import com.ecommerce.shop_api.entity.ProductOption;
import com.ecommerce.shop_api.entity.ProductOptionValue;
import com.ecommerce.shop_api.entity.ProductVariant;
import com.ecommerce.shop_api.exception.ResourceNotFoundException;
import com.ecommerce.shop_api.repository.ProductOptionRepository;
import com.ecommerce.shop_api.repository.ProductOptionValueRepository;
import com.ecommerce.shop_api.repository.ProductRepository;
import com.ecommerce.shop_api.repository.ProductVariantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductVariantService {

    private final ProductRepository productRepository;
    private final ProductOptionRepository optionRepository;
    private final ProductOptionValueRepository optionValueRepository;
    private final ProductVariantRepository variantRepository;

    // ====================================================
    // Option (屬性) CRUD
    // ====================================================

    @Transactional(readOnly = true)
    public List<ProductOptionResponse> getOptions(Long productId) {
        List<ProductOption> options = optionRepository.findByProductIdOrderBySortOrderAsc(productId);
        return options.stream().map(this::mapOptionToResponse).collect(Collectors.toList());
    }

    @Transactional
    public ProductOptionResponse createOption(Long productId, ProductOptionRequest request) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + productId));

        ProductOption option = ProductOption.builder()
                .product(product)
                .nameJa(request.getNameJa())
                .nameZh(request.getNameZh())
                .nameEn(request.getNameEn())
                .sortOrder(request.getSortOrder() != null ? request.getSortOrder() : 0)
                .build();

        ProductOption saved = optionRepository.save(option);

        // 如果一併附帶屬性值
        if (request.getValues() != null) {
            for (int i = 0; i < request.getValues().size(); i++) {
                var valReq = request.getValues().get(i);
                ProductOptionValue value = ProductOptionValue.builder()
                        .option(saved)
                        .valueJa(valReq.getValueJa())
                        .valueZh(valReq.getValueZh())
                        .valueEn(valReq.getValueEn())
                        .sortOrder(valReq.getSortOrder() != null ? valReq.getSortOrder() : i)
                        .build();
                optionValueRepository.save(value);
            }
        }

        return mapOptionToResponse(optionRepository.findById(saved.getId()).orElseThrow());
    }

    @Transactional
    public ProductOptionResponse updateOption(Long optionId, ProductOptionRequest request) {
        ProductOption option = optionRepository.findById(optionId)
                .orElseThrow(() -> new ResourceNotFoundException("Option not found: " + optionId));

        option.setNameJa(request.getNameJa());
        option.setNameZh(request.getNameZh());
        option.setNameEn(request.getNameEn());
        if (request.getSortOrder() != null) option.setSortOrder(request.getSortOrder());

        // 簡化策略：刪除既有 values，重新建立
        if (request.getValues() != null) {
            List<ProductOptionValue> oldValues = optionValueRepository.findByOptionIdOrderBySortOrderAsc(optionId);
            optionValueRepository.deleteAll(oldValues);

            for (int i = 0; i < request.getValues().size(); i++) {
                var valReq = request.getValues().get(i);
                ProductOptionValue value = ProductOptionValue.builder()
                        .option(option)
                        .valueJa(valReq.getValueJa())
                        .valueZh(valReq.getValueZh())
                        .valueEn(valReq.getValueEn())
                        .sortOrder(valReq.getSortOrder() != null ? valReq.getSortOrder() : i)
                        .build();
                optionValueRepository.save(value);
            }
        }

        optionRepository.save(option);
        return mapOptionToResponse(optionRepository.findById(optionId).orElseThrow());
    }

    @Transactional
    public void deleteOption(Long optionId) {
        ProductOption option = optionRepository.findById(optionId)
                .orElseThrow(() -> new ResourceNotFoundException("Option not found: " + optionId));
        optionRepository.delete(option);
    }

    // ====================================================
    // Variant (規格組合) CRUD
    // ====================================================

    @Transactional(readOnly = true)
    public List<ProductVariantResponse> getVariants(Long productId) {
        List<ProductVariant> variants = variantRepository.findByProductIdOrderBySortOrderAsc(productId);
        return variants.stream().map(this::mapVariantToResponse).collect(Collectors.toList());
    }

    @Transactional
    public ProductVariantResponse createVariant(Long productId, ProductVariantRequest request) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + productId));

        if (variantRepository.existsByProductIdAndSku(productId, request.getSku())) {
            throw new RuntimeException("SKU already exists: " + request.getSku());
        }

        Set<ProductOptionValue> optionValues = new HashSet<>();
        if (request.getOptionValueIds() != null) {
            for (Long valueId : request.getOptionValueIds()) {
                ProductOptionValue value = optionValueRepository.findById(valueId)
                        .orElseThrow(() -> new ResourceNotFoundException("Option value not found: " + valueId));
                optionValues.add(value);
            }
        }

        ProductVariant variant = ProductVariant.builder()
                .product(product)
                .sku(request.getSku())
                .price(request.getPrice())
                .stock(request.getStock())
                .status(request.getStatus() != null ? request.getStatus() : "ACTIVE")
                .sortOrder(request.getSortOrder() != null ? request.getSortOrder() : 0)
                .isDefault(false)
                .optionValues(optionValues)
                .build();

        ProductVariant saved = variantRepository.save(variant);
        return mapVariantToResponse(saved);
    }

    @Transactional
    public ProductVariantResponse updateVariant(Long variantId, ProductVariantRequest request) {
        ProductVariant variant = variantRepository.findById(variantId)
                .orElseThrow(() -> new ResourceNotFoundException("Variant not found: " + variantId));

        // SKU 衝突檢查（允許自己保留）
        if (!variant.getSku().equals(request.getSku()) && variantRepository.existsByProductIdAndSku(variant.getProduct().getId(), request.getSku())) {
            throw new RuntimeException("SKU already exists: " + request.getSku());
        }

        variant.setSku(request.getSku());
        variant.setPrice(request.getPrice());
        variant.setStock(request.getStock());
        if (request.getStatus() != null) variant.setStatus(request.getStatus());
        if (request.getSortOrder() != null) variant.setSortOrder(request.getSortOrder());

        if (request.getOptionValueIds() != null) {
            Set<ProductOptionValue> optionValues = new HashSet<>();
            for (Long valueId : request.getOptionValueIds()) {
                ProductOptionValue value = optionValueRepository.findById(valueId)
                        .orElseThrow(() -> new ResourceNotFoundException("Option value not found: " + valueId));
                optionValues.add(value);
            }
            variant.setOptionValues(optionValues);
        }

        ProductVariant updated = variantRepository.save(variant);
        return mapVariantToResponse(updated);
    }

    @Transactional
    public void deleteVariant(Long variantId) {
        ProductVariant variant = variantRepository.findById(variantId)
                .orElseThrow(() -> new ResourceNotFoundException("Variant not found: " + variantId));

        if (Boolean.TRUE.equals(variant.getIsDefault())) {
            throw new RuntimeException("Cannot delete default variant. Delete the product instead.");
        }
        variantRepository.delete(variant);
    }

    // ====================================================
    // Mappers
    // ====================================================

    public ProductOptionResponse mapOptionToResponse(ProductOption option) {
        List<ProductOptionValue> values = optionValueRepository.findByOptionIdOrderBySortOrderAsc(option.getId());
        List<ProductOptionResponse.OptionValueResponse> valueResponses = values.stream()
                .map(v -> ProductOptionResponse.OptionValueResponse.builder()
                        .id(v.getId())
                        .valueJa(v.getValueJa())
                        .valueZh(v.getValueZh())
                        .valueEn(v.getValueEn())
                        .sortOrder(v.getSortOrder())
                        .build())
                .collect(Collectors.toList());

        return ProductOptionResponse.builder()
                .id(option.getId())
                .nameJa(option.getNameJa())
                .nameZh(option.getNameZh())
                .nameEn(option.getNameEn())
                .sortOrder(option.getSortOrder())
                .values(valueResponses)
                .build();
    }

    public ProductVariantResponse mapVariantToResponse(ProductVariant variant) {
        List<ProductVariantResponse.VariantOptionValuePair> pairs = new ArrayList<>();
        if (variant.getOptionValues() != null) {
            for (ProductOptionValue v : variant.getOptionValues()) {
                ProductOption opt = v.getOption();
                pairs.add(ProductVariantResponse.VariantOptionValuePair.builder()
                        .optionId(opt.getId())
                        .optionNameJa(opt.getNameJa())
                        .optionNameZh(opt.getNameZh())
                        .optionNameEn(opt.getNameEn())
                        .valueId(v.getId())
                        .valueJa(v.getValueJa())
                        .valueZh(v.getValueZh())
                        .valueEn(v.getValueEn())
                        .build());
            }
        }

        return ProductVariantResponse.builder()
                .id(variant.getId())
                .productId(variant.getProduct().getId())
                .sku(variant.getSku())
                .price(variant.getPrice())
                .stock(variant.getStock())
                .isDefault(variant.getIsDefault())
                .status(variant.getStatus())
                .sortOrder(variant.getSortOrder())
                .optionValues(pairs)
                .createdAt(variant.getCreatedAt())
                .updatedAt(variant.getUpdatedAt())
                .build();
    }
}
