package com.example.shop.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
public class CloudinaryService {

    private final Cloudinary cloudinary;

    public CloudinaryService(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }

    public String uploadFile(MultipartFile file) throws IOException {
        // 上传文件到 Cloudinary
        Map uploadResult = cloudinary.uploader().upload(
                file.getBytes(),
                ObjectUtils.asMap(
                        "folder", "shop-products",
                        "resource_type", "auto"
                )
        );

        // 返回安全 URL（HTTPS）
        return uploadResult.get("secure_url").toString();
    }

    public void deleteFile(String imageUrl) throws IOException {
        // 从 URL 中提取 public_id
        if (imageUrl != null && imageUrl.contains("cloudinary.com")) {
            // 解析 public_id
            String[] parts = imageUrl.split("/");
            String filename = parts[parts.length - 1];
            String publicId = "shop-products/" + filename.split("\\.")[0];

            // 删除文件
            cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
        }
    }
}