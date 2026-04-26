package com.ecommerce.shop_api.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class ProductResponse {
    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
    private Integer stock;
    private String imageUrl;
    private String status;
    private Long categoryId;
    private String categoryName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ProductResponse() {
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public Integer getStock() {
        return stock;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public String getStatus() {
        return status;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public void setStock(Integer stock) {
        this.stock = stock;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public static ProductResponseBuilder builder() {
        return new ProductResponseBuilder();
    }

    public static class ProductResponseBuilder {
        private final ProductResponse response = new ProductResponse();

        public ProductResponseBuilder id(Long id) {
            response.setId(id);
            return this;
        }

        public ProductResponseBuilder name(String name) {
            response.setName(name);
            return this;
        }

        public ProductResponseBuilder description(String description) {
            response.setDescription(description);
            return this;
        }

        public ProductResponseBuilder price(BigDecimal price) {
            response.setPrice(price);
            return this;
        }

        public ProductResponseBuilder stock(Integer stock) {
            response.setStock(stock);
            return this;
        }

        public ProductResponseBuilder imageUrl(String imageUrl) {
            response.setImageUrl(imageUrl);
            return this;
        }

        public ProductResponseBuilder status(String status) {
            response.setStatus(status);
            return this;
        }

        public ProductResponseBuilder categoryId(Long categoryId) {
            response.setCategoryId(categoryId);
            return this;
        }

        public ProductResponseBuilder categoryName(String categoryName) {
            response.setCategoryName(categoryName);
            return this;
        }

        public ProductResponseBuilder createdAt(LocalDateTime createdAt) {
            response.setCreatedAt(createdAt);
            return this;
        }

        public ProductResponseBuilder updatedAt(LocalDateTime updatedAt) {
            response.setUpdatedAt(updatedAt);
            return this;
        }

        public ProductResponse build() {
            return response;
        }
    }
}