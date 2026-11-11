package com.example.backend.controller;

import com.example.backend.entity.Item;
import com.example.backend.entity.ItemPhoto;
import com.example.backend.repository.ItemPhotoRepository;
import com.example.backend.repository.ItemRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import org.springframework.dao.DataAccessException;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

@RestController
@RequestMapping("/api/item-photos")
@CrossOrigin(origins = "*")
public class ItemPhotoController {

    private final ItemPhotoRepository itemPhotoRepository;
    private final ItemRepository itemRepository;
    private final Path uploadDir;

    public ItemPhotoController(
            ItemPhotoRepository itemPhotoRepository,
            ItemRepository itemRepository,
            @Value("${poolpro.upload-dir:poolpro_uploads}") String uploadDir
    ) {
        this.itemPhotoRepository = itemPhotoRepository;
        this.itemRepository = itemRepository;
        this.uploadDir = Paths.get(uploadDir).toAbsolutePath().normalize();
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public Object addItemPhoto(
            @RequestBody Map<String,Object> request
    ) {

        Integer itemId =
                (Integer) request.get("itemId");

        String title =
                (String) request.get("title");

        String img =
                (String) request.get("img");

        Item item =
                itemRepository.findById(itemId)
                        .orElse(null);

        if(item==null){
            return "Item not found";
        }

        ItemPhoto photo =
                new ItemPhoto();

        photo.setItem(item);
        photo.setTitle(title);
        photo.setImg(img);

        ItemPhoto saved =
                itemPhotoRepository.save(photo);

        Map<String,Object> response =
                new HashMap<>();

        response.put(
                "idItemPhoto",
                saved.getIdItemPhoto()
        );

        response.put(
                "itemId",
                saved.getItem().getIdItem()
        );

        response.put(
                "title",
                saved.getTitle()
        );

        response.put(
                "img",
                saved.getImg()
        );

        return response;
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
@PreAuthorize("hasRole('SUPERVISOR')")
@Transactional
public Object uploadItemPhoto(
        @RequestParam Integer itemId,
        @RequestParam("file") MultipartFile file,
        @RequestParam(required = false) String title,
        @RequestParam(defaultValue = "false") boolean replaceExisting
) {
    if (file == null || file.isEmpty()) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Image file is required");
    }

    Item item = itemRepository.findById(itemId).orElse(null);
    if (item == null) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Item not found");
    }

    String imagePath;
    try {
        byte[] bytes = file.getBytes();
        ImageInfo imageInfo = readImageInfo(bytes);
        String extension = resolveExtension(file.getOriginalFilename(), file.getContentType());
        String fileName = buildImageFileName(itemId, imageInfo, bytes.length, extension, bytes);

        Files.createDirectories(uploadDir);
        Path target = uploadDir.resolve(fileName).normalize();
        if (!target.startsWith(uploadDir)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid image file name");
        }

        Files.write(target, bytes);
        imagePath = "poolpro_uploads/" + fileName;
        
    } catch (IOException e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to store file on disk");
    }

    // Ako je čekirano brisanje starih fotki za ovaj item
    if (replaceExisting) {
        itemPhotoRepository.deleteByItem_IdItem(itemId);
    }

    // UPIS U BAZU - Sada sigurno dolazi do ovog dijela!
    ItemPhoto photo = new ItemPhoto();
    photo.setItem(item);
    photo.setTitle(normalizeTitle(title, item.getTitle()));
    photo.setImg(imagePath);

    try {
        ItemPhoto saved = itemPhotoRepository.save(photo);
        return toResponse(saved);
    } catch (DataAccessException e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Failed to save item photo in database: " + e.getMostSpecificCause().getMessage());
    }
}
    @GetMapping("/item/{itemId}")
    public Object getItemPhotos(
            @PathVariable Integer itemId
    ) {

        return itemPhotoRepository
                .findByItem_IdItem(itemId)
                .stream()
                .map(this::toResponse).toList();
    }

    private Map<String, Object> toResponse(ItemPhoto photo) {
        Map<String,Object> response = new HashMap<>();
        response.put("idItemPhoto", photo.getIdItemPhoto());
        response.put("itemId", photo.getItem().getIdItem());
        response.put("title", photo.getTitle());
        response.put("img", photo.getImg());
        response.put("imgUrl", publicImageUrl(photo.getImg()));
        return response;
    }

    private String publicImageUrl(String imagePath) {
        if (imagePath == null || imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
            return imagePath;
        }

        String fileName = imagePath.startsWith("poolpro_uploads/")
                ? imagePath.substring("poolpro_uploads/".length())
                : imagePath;

        return ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/poolpro_uploads/")
                .path(fileName)
                .toUriString();
    }

    private String normalizeTitle(String title, String fallback) {
        String value = title == null || title.isBlank() ? fallback : title.trim();
        if (value == null || value.isBlank()) {
            value = "Item photo";
        }

        return value.length() > 45 ? value.substring(0, 45) : value;
    }

    private String buildImageFileName(
            Integer itemId,
            ImageInfo imageInfo,
            int fileSize,
            String extension,
            byte[] bytes
    ) {
        String hash = sha256(bytes).substring(0, 12);
        return "item_" + itemId
                + "_" + imageInfo.width() + "x" + imageInfo.height()
                + "_" + fileSize
                + "_" + hash
                + extension;
    }

    private ImageInfo readImageInfo(byte[] bytes) throws IOException {
        try (InputStream inputStream = new java.io.ByteArrayInputStream(bytes)) {
            BufferedImage image = ImageIO.read(inputStream);
            if (image == null) {
                throw new IOException("Invalid image file");
            }
            return new ImageInfo(image.getWidth(), image.getHeight());
        }
    }

    private String resolveExtension(String originalFilename, String contentType) {
        String lowerName = originalFilename == null ? "" : originalFilename.toLowerCase(Locale.ROOT);
        int dotIndex = lowerName.lastIndexOf('.');
        if (dotIndex >= 0 && dotIndex < lowerName.length() - 1) {
            String extension = lowerName.substring(dotIndex);
            if (extension.matches("\\.(jpg|jpeg|png|gif|webp|bmp)")) {
                return extension;
            }
        }

        String lowerContentType = contentType == null ? "" : contentType.toLowerCase(Locale.ROOT);
        return switch (lowerContentType) {
            case "image/jpeg" -> ".jpg";
            case "image/png" -> ".png";
            case "image/gif" -> ".gif";
            case "image/webp" -> ".webp";
            case "image/bmp" -> ".bmp";
            default -> ".img";
        };
    }

    private String sha256(byte[] bytes) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(bytes));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 is not available", e);
        }
    }

    private record ImageInfo(int width, int height) {}

}
