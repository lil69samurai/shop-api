package com.ecommerce.shop_api.service;

import com.ecommerce.shop_api.dto.request.ProductRequest;
import com.ecommerce.shop_api.dto.response.ProductResponse;
import com.ecommerce.shop_api.entity.Category;
import com.ecommerce.shop_api.entity.Product;
import com.ecommerce.shop_api.entity.ProductImage;
import com.ecommerce.shop_api.exception.ResourceNotFoundException;
import com.ecommerce.shop_api.repository.CategoryRepository;
import com.ecommerce.shop_api.repository.ProductImageRepository;
import com.ecommerce.shop_api.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class ProductService {
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ProductImageRepository productImageRepository;

    @Transactional
    public ProductResponse createProduct(ProductRequest request) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Can't find Category ID: " + request.getCategoryId()));

        Product product = Product.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .stock(request.getStock())
                .imageUrl(request.getImageUrl())
                .category(category)
                .build();

        Product saved = productRepository.save(product);
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public Page<ProductResponse> getAllProducts(Pageable pageable) {
        return productRepository.findAll(pageable).map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public Page<ProductResponse> searchProducts(String keyword, Long categoryId, BigDecimal minPrice, BigDecimal maxPrice, Pageable pageable) {
        boolean hasKeyword = keyword != null && !keyword.trim().isEmpty();
        boolean hasCategory = categoryId != null;
        boolean hasPrice = minPrice != null && maxPrice != null;

        Page<Product> products;

        if (hasKeyword && hasCategory && hasPrice) {
            products = productRepository.searchByKeywordAndCategoryAndPriceBetween(keyword, categoryId, minPrice, maxPrice, pageable);
        } else if (hasKeyword && hasCategory) {
            products = productRepository.searchByKeywordAndCategory(keyword, categoryId, pageable);
        } else if (hasKeyword && hasPrice) {
            products = productRepository.searchByKeywordAndPriceBetween(keyword, minPrice, maxPrice, pageable);
        } else if (hasCategory && hasPrice) {
            products = productRepository.findByCategoryIdAndPriceBetween(categoryId, minPrice, maxPrice, pageable);
        } else if (hasKeyword) {
            products = productRepository.searchByKeyword(keyword, pageable);
        } else if (hasCategory) {
            products = productRepository.findByCategoryId(categoryId, pageable);
        } else if (hasPrice) {
            products = productRepository.findByPriceBetween(minPrice, maxPrice, pageable);
        } else {
            products = productRepository.findAll(pageable);
        }

        return products.map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public Page<ProductResponse> searchProducts(String keyword, Long categoryId, Pageable pageable) {
        return searchProducts(keyword, categoryId, null, null, pageable);
    }

    @Transactional(readOnly = true)
    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("找不到該商品 ID: " + id));
        return mapToResponse(product);
    }

    @Transactional
    public ProductResponse updateProduct(Long id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Can't find Product ID: " + id));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Can't find Category ID: " + request.getCategoryId()));

        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setStock(request.getStock());
        product.setCategory(category);

        if (request.getImageUrl() != null) {
            product.setImageUrl(request.getImageUrl());
        }

        Product updated = productRepository.save(product);
        return mapToResponse(updated);
    }

    @Transactional
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Can't find Product ID: " + id));
        productRepository.delete(product);
    }

    @Transactional
    public ProductResponse updateProductImage(Long id, String imageUrl) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Can't find Product ID: " + id));
        product.setImageUrl(imageUrl);
        Product updated = productRepository.save(product);
        return mapToResponse(updated);
    }

    @Transactional
    public ProductResponse reorderProductImages(Long productId, List<Long> imageIds) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + productId));

        List<ProductImage> currentImages = productImageRepository.findByProductIdOrderBySortOrderAsc(productId);

        if (currentImages.size() != imageIds.size()) {
            throw new RuntimeException("Image count mismatch | 圖片數量不一致");
        }

        Set<Long> currentIdSet = new HashSet<>();
        for (ProductImage img : currentImages) {
            currentIdSet.add(img.getId());
        }

        Set<Long> requestIdSet = new HashSet<>(imageIds);
        if (!currentIdSet.equals(requestIdSet)) {
            throw new RuntimeException("Invalid image list for this product | 圖片清單不屬於此商品");
        }

        for (int i = 0; i < imageIds.size(); i++) {
            Long imageId = imageIds.get(i);
            for (ProductImage img : currentImages) {
                if (img.getId().equals(imageId)) {
                    img.setSortOrder(i);
                    break;
                }
            }
        }

        productImageRepository.saveAll(currentImages);

        List<ProductImage> reordered = productImageRepository.findByProductIdOrderBySortOrderAsc(productId);
        if (!reordered.isEmpty()) {
            product.setImageUrl(reordered.get(0).getImageUrl());
        } else {
            product.setImageUrl(null);
        }
        productRepository.save(product);

        return mapToResponse(product);
    }

    @Transactional
    public ProductResponse deleteProductImageAndReorder(Long imageId) {
        ProductImage img = productImageRepository.findById(imageId)
                .orElseThrow(() -> new ResourceNotFoundException("Image not found: " + imageId));

        Long productId = img.getProduct().getId();
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + productId));

        productImageRepository.delete(img);
        productImageRepository.flush();

        normalizeImageSortOrder(productId);

        List<ProductImage> remaining = productImageRepository.findByProductIdOrderBySortOrderAsc(productId);
        if (!remaining.isEmpty()) {
            product.setImageUrl(remaining.get(0).getImageUrl());
        } else {
            product.setImageUrl(null);
        }
        productRepository.save(product);

        return mapToResponse(product);
    }

    @Transactional
    public void normalizeImageSortOrder(Long productId) {
        List<ProductImage> images = productImageRepository.findByProductIdOrderBySortOrderAsc(productId);
        for (int i = 0; i < images.size(); i++) {
            images.get(i).setSortOrder(i);
        }
        productImageRepository.saveAll(images);
    }

    private ProductResponse mapToResponse(Product product) {
        List<ProductImage> sortedImages = productImageRepository.findByProductIdOrderBySortOrderAsc(product.getId());

        List<String> imageUrls = new ArrayList<>();
        List<Long> imageIds = new ArrayList<>();

        if (!sortedImages.isEmpty()) {
            for (ProductImage img : sortedImages) {
                imageUrls.add(img.getImageUrl());
                imageIds.add(img.getId());
            }
        } else if (product.getImageUrl() != null) {
            imageUrls.add(product.getImageUrl());
        }

        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .stock(product.getStock())
                .imageUrl(product.getImageUrl())
                .imageUrls(imageUrls)
                .imageIds(imageIds)
                .status(product.getStatus().name())
                .categoryId(product.getCategory().getId())
                .categoryName(product.getCategory().getName())
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }
}
