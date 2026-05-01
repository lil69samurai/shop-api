package com.ecommerce.shop_api.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;

@Data
public class ProductOptionRequest {

    @NotBlank(message = "Option name (ja) can not be empty.")
    private String nameJa;

    private String nameZh;
    private String nameEn;
    private Integer sortOrder;

    // 屬性值清單
    private List<OptionValueRequest> values;

    @Data
    public static class OptionValueRequest {
        private Long id; // 編輯時使用
        @NotBlank(message = "Option value (ja) can not be empty.")
        private String valueJa;
        private String valueZh;
        private String valueEn;
        private Integer sortOrder;
    }
}
