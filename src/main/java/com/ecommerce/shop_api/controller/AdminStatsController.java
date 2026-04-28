package com.ecommerce.shop_api.controller;

import com.ecommerce.shop_api.dto.response.ApiResponse;
import com.ecommerce.shop_api.enums.OrderStatus;
import com.ecommerce.shop_api.repository.OrderRepository;
import com.ecommerce.shop_api.repository.ProductRepository;
import com.ecommerce.shop_api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.*;

@RestController
@RequestMapping("/api/admin/stats")
@RequiredArgsConstructor
public class AdminStatsController {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboardStats() {
        Map<String, Object> stats = new LinkedHashMap<>();

        // Basic counts
        long totalProducts = productRepository.count();
        long totalUsers = userRepository.count();
        long totalOrders = orderRepository.count();

        stats.put("totalProducts", totalProducts);
        stats.put("totalUsers", totalUsers);
        stats.put("totalOrders", totalOrders);

        // Revenue: sum of totalAmount for non-cancelled orders
        BigDecimal totalRevenue = orderRepository.findAll().stream()
                .filter(o -> o.getStatus() != OrderStatus.CANCELLED)
                .map(o -> o.getTotalAmount())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        stats.put("totalRevenue", totalRevenue);

        // Orders by status
        Map<String, Long> ordersByStatus = new LinkedHashMap<>();
        for (OrderStatus status : OrderStatus.values()) {
            long count = orderRepository.findAll().stream()
                    .filter(o -> o.getStatus() == status)
                    .count();
            ordersByStatus.put(status.name(), count);
        }
        stats.put("ordersByStatus", ordersByStatus);

        // Recent orders (last 5)
        List<Map<String, Object>> recentOrders = new ArrayList<>();
        orderRepository.findAll().stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .limit(5)
                .forEach(order -> {
                    Map<String, Object> o = new LinkedHashMap<>();
                    o.put("id", order.getId());
                    o.put("username", order.getUser().getUsername());
                    o.put("totalAmount", order.getTotalAmount());
                    o.put("status", order.getStatus().name());
                    o.put("paymentMethod", order.getPaymentMethod());
                    o.put("createdAt", order.getCreatedAt().toString());
                    recentOrders.add(o);
                });
        stats.put("recentOrders", recentOrders);

        // Low stock products (stock <= 5)
        List<Map<String, Object>> lowStockProducts = new ArrayList<>();
        productRepository.findAll().stream()
                .filter(p -> p.getStock() <= 5)
                .sorted((a, b) -> Integer.compare(a.getStock(), b.getStock()))
                .limit(10)
                .forEach(product -> {
                    Map<String, Object> p = new LinkedHashMap<>();
                    p.put("id", product.getId());
                    p.put("name", product.getName());
                    p.put("stock", product.getStock());
                    p.put("price", product.getPrice());
                    lowStockProducts.add(p);
                });
        stats.put("lowStockProducts", lowStockProducts);

        return ResponseEntity.ok(ApiResponse.success("Dashboard stats", stats));
    }
}
