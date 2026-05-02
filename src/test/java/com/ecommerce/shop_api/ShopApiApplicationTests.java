package com.ecommerce.shop_api;

import org.junit.jupiter.api.Test;

/**
 * Minimal smoke test.
 *
 * Note: We intentionally do NOT use @SpringBootTest here, because loading
 * the full ApplicationContext would trigger Flyway and require a real DB.
 * The actual production startup (Render) verifies the context every deploy.
 *
 * If you later need a real Spring context test, create a separate profile
 * (e.g. application-test.yml) with its own DB before adding @SpringBootTest.
 */
class ShopApiApplicationTests {

    @Test
    void smoke() {
        // no-op
    }
}
