package com.ecommerce.shop_api.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class ProductOptionResponse {
    private Long id;
    private String nameJa;
    private String nameZh;
    private String nameEn;
    private Integer sortOrder;
    private List<OptionValueResponse> values;

    @Data
    @Builder
    public static class OptionValueResponse {
        private Long id;
        private String valueJa;
        private String valueZh;
        private String valueEn;
        private Integer sortOrder;
    }
}
