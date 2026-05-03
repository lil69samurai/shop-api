package com.ecommerce.shop_api.service;

import com.ecommerce.shop_api.entity.Order;
import com.ecommerce.shop_api.entity.OrderItem;
import com.ecommerce.shop_api.entity.User;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;

/**
 * Email notification service for order events.
 * 注文関連のメール通知サービス。
 *
 * All methods are async and non-blocking — failures will be logged
 * but will not interrupt the order flow.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String mailUsername;

    @Value("${app.mail.from-name:剣道ショップ}")
    private String fromName;

    @Value("${app.mail.enabled:true}")
    private boolean mailEnabled;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    private static final DateTimeFormatter DATE_FMT =
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    @PostConstruct
    public void init() {
        if (!mailEnabled) {
            log.warn("⚠️  EmailService: mail sending is DISABLED (app.mail.enabled=false)");
        } else if (mailUsername == null || mailUsername.isBlank()) {
            log.warn("⚠️  EmailService: MAIL_USERNAME not configured — emails will fail!");
        } else {
            log.info("✉️  EmailService: ready (from={}, sender={})", fromName, mailUsername);
        }
    }

    // ============================================================
    // Public API
    // ============================================================

    @Async("emailExecutor")
    public void sendOrderCreatedEmail(Order order) {
        if (!shouldSend(order)) return;

        String subject = String.format("【剣道ショップ】ご注文ありがとうございます (注文番号: #%d)", order.getId());
        String body = buildOrderCreatedBody(order);
        send(order.getUser().getEmail(), subject, body, "ORDER_CREATED", order.getId());
    }

    @Async("emailExecutor")
    public void sendOrderShippedEmail(Order order) {
        if (!shouldSend(order)) return;

        String subject = String.format("【剣道ショップ】ご注文を発送しました (注文番号: #%d)", order.getId());
        String body = buildOrderShippedBody(order);
        send(order.getUser().getEmail(), subject, body, "ORDER_SHIPPED", order.getId());
    }

    @Async("emailExecutor")
    public void sendOrderCancelledEmail(Order order) {
        if (!shouldSend(order)) return;

        String subject = String.format("【剣道ショップ】ご注文がキャンセルされました (注文番号: #%d)", order.getId());
        String body = buildOrderCancelledBody(order);
        send(order.getUser().getEmail(), subject, body, "ORDER_CANCELLED", order.getId());
    }

    // ============================================================
    // Body builders
    // ============================================================

    private String buildOrderCreatedBody(Order order) {
        StringBuilder sb = new StringBuilder();
        User user = order.getUser();

        sb.append(safeName(order, user)).append(" 様\n\n");
        sb.append("この度は剣道ショップをご利用いただき、誠にありがとうございます。\n");
        sb.append("ご注文を受け付けましたので、内容をご確認ください。\n\n");

        appendOrderHeader(sb, order);
        appendItems(sb, order);
        appendShipping(sb, order);
        appendFooter(sb, order);

        return sb.toString();
    }

    private String buildOrderShippedBody(Order order) {
        StringBuilder sb = new StringBuilder();
        User user = order.getUser();

        sb.append(safeName(order, user)).append(" 様\n\n");
        sb.append("ご注文の商品を発送いたしました。\n");
        sb.append("商品の到着まで今しばらくお待ちください。\n\n");

        appendOrderHeader(sb, order);
        appendItems(sb, order);
        appendShipping(sb, order);
        appendFooter(sb, order);

        return sb.toString();
    }

    private String buildOrderCancelledBody(Order order) {
        StringBuilder sb = new StringBuilder();
        User user = order.getUser();

        sb.append(safeName(order, user)).append(" 様\n\n");
        sb.append("ご注文がキャンセルされました。\n");
        sb.append("商品の在庫は復元され、お支払いが発生していた場合は返金処理が行われます。\n\n");

        appendOrderHeader(sb, order);
        appendItems(sb, order);
        appendFooter(sb, order);

        return sb.toString();
    }

    // ============================================================
    // Body sections
    // ============================================================

    private void appendOrderHeader(StringBuilder sb, Order order) {
        sb.append("───────────────────────────\n");
        sb.append("ご注文情報\n");
        sb.append("───────────────────────────\n");
        sb.append("注文番号: #").append(order.getId()).append("\n");
        if (order.getCreatedAt() != null) {
            sb.append("注文日時: ").append(order.getCreatedAt().format(DATE_FMT)).append("\n");
        }
        sb.append("ステータス: ").append(jaStatus(order.getStatus().name())).append("\n");
        if (order.getPaymentMethod() != null) {
            sb.append("お支払方法: ").append(order.getPaymentMethod()).append("\n");
        }
        sb.append("\n");
    }

    private void appendItems(StringBuilder sb, Order order) {
        sb.append("───────────────────────────\n");
        sb.append("ご注文商品\n");
        sb.append("───────────────────────────\n");

        for (OrderItem item : order.getItems()) {
            sb.append("● ").append(item.getProduct().getName());
            if (item.getVariantName() != null && !item.getVariantName().isBlank()) {
                sb.append(" [").append(item.getVariantName()).append("]");
            }
            sb.append("\n");
            if (item.getSku() != null) {
                sb.append("  SKU: ").append(item.getSku()).append("\n");
            }
            BigDecimal subtotal = item.getPriceAtPurchase()
                    .multiply(BigDecimal.valueOf(item.getQuantity()));
            sb.append("  数量: ").append(item.getQuantity())
              .append(" × ¥").append(item.getPriceAtPurchase())
              .append(" = ¥").append(subtotal).append("\n\n");
        }

        sb.append("合計金額: ¥").append(order.getTotalAmount()).append("\n\n");
    }

    private void appendShipping(StringBuilder sb, Order order) {
        sb.append("───────────────────────────\n");
        sb.append("お届け先\n");
        sb.append("───────────────────────────\n");
        if (order.getRecipientName() != null) sb.append("お名前: ").append(order.getRecipientName()).append("\n");
        if (order.getPhone() != null)         sb.append("電話番号: ").append(order.getPhone()).append("\n");
        if (order.getZipCode() != null)       sb.append("郵便番号: ").append(order.getZipCode()).append("\n");
        if (order.getAddress() != null)       sb.append("ご住所: ").append(order.getAddress()).append("\n");
        if (order.getNote() != null && !order.getNote().isBlank()) {
            sb.append("備考: ").append(order.getNote()).append("\n");
        }
        sb.append("\n");
    }

    private void appendFooter(StringBuilder sb, Order order) {
        sb.append("───────────────────────────\n");
        sb.append("注文詳細はこちらからご確認いただけます:\n");
        sb.append(frontendUrl).append("/orders/").append(order.getId()).append("\n\n");
        sb.append("ご不明な点がございましたら、お気軽にお問い合わせください。\n");
        sb.append("引き続き剣道ショップをよろしくお願い申し上げます。\n\n");
        sb.append("──\n");
        sb.append(fromName).append("\n");
        sb.append("※このメールは自動送信です。返信されてもお答えできません。\n");
    }

    // ============================================================
    // Helpers
    // ============================================================

    private boolean shouldSend(Order order) {
        if (!mailEnabled) {
            log.info("📭 mail disabled — skip sending for order #{}", order.getId());
            return false;
        }
        if (order == null || order.getUser() == null) {
            log.warn("📭 order or user is null — skip sending");
            return false;
        }
        String email = order.getUser().getEmail();
        if (email == null || email.isBlank()) {
            log.warn("📭 user email is blank — skip sending for order #{}", order.getId());
            return false;
        }
        return true;
    }

    private void send(String to, String subject, String body, String type, Long orderId) {
        try {
            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setFrom(mailUsername);
            msg.setTo(to);
            msg.setSubject(subject);
            msg.setText(body);
            mailSender.send(msg);
            log.info("✉️  sent [{}] order #{} → {}", type, orderId, to);
        } catch (Exception e) {
            log.error("❌ failed to send [{}] order #{} → {}: {}", type, orderId, to, e.getMessage());
        }
    }

    private String safeName(Order order, User user) {
        if (order.getRecipientName() != null && !order.getRecipientName().isBlank()) {
            return order.getRecipientName();
        }
        return user.getUsername();
    }

    private String jaStatus(String status) {
        return switch (status) {
            case "PENDING"   -> "未払い";
            case "PAID"      -> "支払い済み";
            case "SHIPPED"   -> "発送済み";
            case "DELIVERED" -> "配達済み";
            case "COMPLETED" -> "完了";
            case "CANCELLED" -> "キャンセル";
            default          -> status;
        };
    }
}
