package com.ecommerce.shop_api.service;

import com.ecommerce.shop_api.dto.request.CategoryRequest;
import com.ecommerce.shop_api.dto.response.CategoryResponse;
import com.ecommerce.shop_api.entity.Category;
import com.ecommerce.shop_api.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {
    private final CategoryRepository categoryRepository;
    // Build Category.
    @Transactional
    public CategoryResponse createCategory(CategoryRequest request) {
        // Check if the name is double.
        if (categoryRepository.existsByName(request.getName())) {
            throw new RuntimeException("Category name already exist");
        }

        Category category = Category.builder()
                .name(request.getName())
                .description(request.getDescription())
                .build();

        Category saved = categoryRepository.save(category);
        return mapToResponse(saved);
    }

    // Get all Category
    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    //
    private CategoryResponse mapToResponse(Category category) {
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .createdAt(category.getCreatedAt())
                .build();
    }
}
