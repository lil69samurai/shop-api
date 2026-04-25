package com.ecommerce.shop_api.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Primary
@Service
public class CloudinaryFileStorageService implements FileStorageService {

    private final Cloudinary cloudinary;

    public CloudinaryFileStorageService(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }

    @Override
    public String saveFile(MultipartFile file) {
        try {
            Map uploadResult = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "folder", "shop-products",
                            "resource_type", "auto"
                    )
            );

            return uploadResult.get("secure_url").toString();
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload file to Cloudinary", e);
        }
    }

    @Override
    public void deleteFile(String fileUrl) {
        if (fileUrl == null || !fileUrl.contains("cloudinary.com")) {
            return;
        }

        try {
            String publicId = extractPublicId(fileUrl);
            if (publicId != null) {
                cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to delete file from Cloudinary", e);
        }
    }

    private String extractPublicId(String fileUrl) {
        try {
            String[] parts = fileUrl.split("/");
            int uploadIndex = -1;

            for (int i = 0; i < parts.length; i++) {
                if ("upload".equals(parts[i])) {
                    uploadIndex = i;
                    break;
                }
            }

            if (uploadIndex == -1 || uploadIndex + 1 >= parts.length) {
                return null;
            }

            StringBuilder publicId = new StringBuilder();
            for (int i = uploadIndex + 1; i < parts.length; i++) {
                if (parts[i].startsWith("v")) {
                    continue;
                }

                if (publicId.length() > 0) {
                    publicId.append("/");
                }

                String part = parts[i];
                int dotIndex = part.lastIndexOf(".");
                if (dotIndex != -1) {
                    part = part.substring(0, dotIndex);
                }

                publicId.append(part);
            }

            return publicId.toString();
        } catch (Exception e) {
            return null;
        }
    }
}