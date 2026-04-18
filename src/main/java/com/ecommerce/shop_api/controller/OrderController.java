package com.ecommerce.shop_api.controller;

import com.ecommerce.shop_api.dto.request.OrderRequest;
import com.ecommerce.shop_api.dto.response.ApiResponse;
import com.ecommerce.shop_api.dto.response.OrderResponse;
import com.ecommerce.shop_api.entity.User;
import com.ecommerce.shop_api.enums.OrderStatus;
import com.ecommerce.shop_api.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    // POST: Create order | 注文を作成する
    @PostMapping
    public ResponseEntity<ApiResponse<OrderResponse>> createOrder(
            @Valid @RequestBody OrderRequest request,
            @AuthenticationPrincipal User currentUser) {
        OrderResponse response = orderService.createOrder(request, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Order created successfully | 注文が正常に作成されました", response));
    }

    // GET: Get my orders | 自分の注文を取得する
    @GetMapping
    public ResponseEntity<ApiResponse<Page<OrderResponse>>> getMyOrders(
            @AuthenticationPrincipal User currentUser,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<OrderResponse> orders = orderService.getMyOrders(currentUser, pageable);
        return ResponseEntity.ok(ApiResponse.success("Orders retrieved successfully | 注文を取得しました", orders));
    }

    // GET: Get single order | 注文を1件取得する
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrderById(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {
        OrderResponse response = orderService.getOrderById(id, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Order retrieved successfully | 注文を取得しました", response));
    }
    // PATCH: Update order status (Admin only) | 注文ステータスを更新する（管理者のみ）
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<OrderResponse>> updateOrderStatus(
            @PathVariable Long id,
            @RequestParam OrderStatus status) {
        OrderResponse response = orderService.updateOrderStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success("Order status updated | 注文ステータスが更新されました", response));
    }
}