package com.ecommerce.shop_api.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "order_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Many items belong to one order | 多くの明細は1つの注文に属する
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    // Many items reference one product | 多くの明細は1つの商品を参照する
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    // Optional: variant reference for SKU-based purchase
    // 可選：購買的規格 (SKU)。可為 null 以相容無規格商品
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_variant_id")
    private ProductVariant productVariant;

    // SKU snapshot at purchase time
    // 下單當下的 SKU 快照（即使日後修改規格名稱，訂單仍保留原始資訊）
    @Column(name = "sku", length = 100)
    private String sku;

    // Variant display name snapshot e.g. "サイズ:39 / 色:赤"
    @Column(name = "variant_name", length = 255)
    private String variantName;

    @Column(nullable = false)
    private Integer quantity;

    // Store price at time of purchase | 購入時の価格を保存する
    @Column(name = "price_at_purchase", nullable = false)
    private BigDecimal priceAtPurchase;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
