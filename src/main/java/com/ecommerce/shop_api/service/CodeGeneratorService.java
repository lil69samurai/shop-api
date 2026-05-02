package com.ecommerce.shop_api.service;

import com.ecommerce.shop_api.entity.Product;
import com.ecommerce.shop_api.repository.CategoryRepository;
import com.ecommerce.shop_api.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CodeGeneratorService {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    /**
     * 產生分類代號：取英文名前 2 字大寫；若無英文則用 AA/AB/AC...
     * 撞名自動 +1
     */
    public String generateCategoryCode(String name) {
        String base = guessCategoryBase(name);
        String candidate = base;
        int suffix = 1;
        while (categoryRepository.existsByCode(candidate)) {
            // 撞了 → 把第二字母往後挪
            candidate = nextCode(base, suffix++);
            if (suffix > 26 * 26) {
                throw new RuntimeException("Cannot generate unique category code");
            }
        }
        return candidate;
    }

    private String guessCategoryBase(String name) {
        if (name == null) return "AA";
        StringBuilder letters = new StringBuilder();
        for (char c : name.toCharArray()) {
            if ((c >= 'A' && c <= 'Z') || (c >= 'a' && c <= 'z')) {
                letters.append(Character.toUpperCase(c));
                if (letters.length() == 2) break;
            }
        }
        if (letters.length() == 2) return letters.toString();
        return "AA";
    }

    private String nextCode(String base, int offset) {
        // base 失敗時往後找 AA, AB, AC...
        int total = (base.charAt(0) - 'A') * 26 + (base.charAt(1) - 'A') + offset;
        total = total % (26 * 26);
        char c1 = (char) ('A' + (total / 26));
        char c2 = (char) ('A' + (total % 26));
        return "" + c1 + c2;
    }

    /**
     * 產生商品代號：P0001, P0002...
     */
    public String generateProductCode() {
        Optional<Product> top = productRepository.findTopByProductCodeStartingWithOrderByProductCodeDesc("P");
        int next = 1;
        if (top.isPresent()) {
            String code = top.get().getProductCode();
            try {
                next = Integer.parseInt(code.substring(1)) + 1;
            } catch (Exception ignored) {}
        }
        String candidate;
        do {
            candidate = String.format("P%04d", next++);
        } while (productRepository.existsByProductCode(candidate));
        return candidate;
    }

    /**
     * 組合 SKU：productCode + valueCodes
     * 任一 valueCode 為空 → 用 ? 代替（理論上前端會擋）
     */
    public String generateSku(String productCode, List<String> valueCodes) {
        StringBuilder sb = new StringBuilder();
        sb.append(productCode == null ? "P0000" : productCode);
        if (valueCodes != null) {
            for (String v : valueCodes) {
                sb.append("-").append(v == null || v.isBlank() ? "?" : v);
            }
        }
        return sb.toString();
    }
}
