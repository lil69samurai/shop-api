package com.ecommerce.shop_api.dto.request;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 更新使用者預設收件資訊。
 * 所有欄位都是 optional（允許 null 或空字串清空）。
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class UpdateDefaultRecipientRequest {

    @Size(max = 100)
    private String defaultRecipientName;

    @Size(max = 20)
    private String defaultPhone;

    @Size(max = 10)
    private String defaultZipCode;

    @Size(max = 500)
    private String defaultAddress;

    @Size(max = 500)
    private String defaultNote;
}
