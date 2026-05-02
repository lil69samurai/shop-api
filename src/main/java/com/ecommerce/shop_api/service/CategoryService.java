package com.ecommerce.shop_api.service;

import com.ecommerce.shop_api.dto.request.CategoryRequest;
import com.ecommerce.shop_api.dto.response.CategoryResponse;
import com.ecommerce.shop_api.entity.Category;
import com.ecommerce.shop_api.exception.ResourceNotFoundException;
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
    private final CodeGeneratorService codeGeneratorService;

    @Transactional
    public CategoryResponse createCategory(CategoryRequest request) {
        if (categoryRepository.existsByName(request.getName())) {
            throw new RuntimeException("Category name already exist");
        }

        String code = request.getCode() == null ? null : request.getCode().trim().toUpperCase();
        if (code == null || code.isBlank()) {
            code = codeGeneratorService.generateCategoryCode(request.getName());
        } else if (categoryRepository.existsByCode(code)) {
            throw new RuntimeException("Category code already exist: " + code);
        }

        Category category = Category.builder()
                .name(request.getName())
                .code(code)
                .description(request.getDescription())
                .build();

        Category saved = categoryRepository.save(category);
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CategoryResponse getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
        return mapToResponse(category);
    }

    @Transactional
    public CategoryResponse updateCategory(Long id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));

        if (!category.getName().equals(request.getName())
                && categoryRepository.existsByName(request.getName())) {
            throw new RuntimeException("Category name already exist");
        }

        String newCode = request.getCode() == null ? null : request.getCode().trim().toUpperCase();
        if (newCode != null && !newCode.isBlank() && !newCode.equals(category.getCode())) {
            if (categoryRepository.existsByCode(newCode)) {
                throw new RuntimeException("Category code already exist: " + newCode);
            }
            category.setCode(newCode);
        }

        category.setName(request.getName());
        category.setDescription(request.getDescription());

        Category saved = categoryRepository.save(category);
        return mapToResponse(saved);
    }

    @Transactional
    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
        categoryRepository.delete(category);
    }

    private CategoryResponse mapToResponse(Category category) {
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .code(category.getCode())
                .description(category.getDescription())
                .createdAt(category.getCreatedAt())
                .build();
    }
}
