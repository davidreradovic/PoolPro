package com.example.backend.controller;

import com.example.backend.dto.ItemPhotoRequest;
import com.example.backend.dto.TaskPhotoRequest;
import com.example.backend.entity.Item;
import com.example.backend.entity.ItemPhoto;
import com.example.backend.entity.Photo;
import com.example.backend.entity.Task;
import com.example.backend.repository.ItemPhotoRepository;
import com.example.backend.repository.ItemRepository;
import com.example.backend.repository.PhotoRepository;
import com.example.backend.repository.TaskRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

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

@RestController
@RequestMapping("/api/photos")
@CrossOrigin(origins = "*")
public class PhotoController {

    private final PhotoRepository photoRepository;
    private final TaskRepository taskRepository;
    private final ItemPhotoRepository itemPhotoRepository;
    private final ItemRepository itemRepository;
    private final Path uploadDir;

    public PhotoController(
            PhotoRepository photoRepository,
            TaskRepository taskRepository,
            ItemPhotoRepository itemPhotoRepository,
            ItemRepository itemRepository,
            @Value("${poolpro.upload-dir:poolpro_uploads}") String uploadDir
    ) {
        this.photoRepository = photoRepository;
        this.taskRepository = taskRepository;
        this.itemPhotoRepository = itemPhotoRepository;
        this.itemRepository = itemRepository;
        this.uploadDir = Paths.get(uploadDir).toAbsolutePath().normalize();
    }

    @PostMapping("/task/{taskId}")
    @PreAuthorize("hasAnyRole('EMPLOYEE','SUPERVISOR', 'CLIENT')")
    public Object addTaskPhoto(
            @PathVariable Integer taskId,
            @Valid @RequestBody TaskPhotoRequest request
    ) {
        String img = request.getImg();

        Task task = taskRepository.findById(taskId).orElse(null);

        if (task == null) {
            return "Task not found";
        }

        Photo photo = new Photo();
        photo.setTask(task);
        photo.setImg(img);

        Photo saved = photoRepository.save(photo);

        Map<String, Object> response = new HashMap<>();
        response.put("idPhoto", saved.getIdPhoto());
        response.put("taskId", saved.getTask().getIdTask());
        response.put("img", saved.getImg());
        response.put("imgUrl", publicImageUrl(saved.getImg()));

        return response;
    }

    @PostMapping(value = "/task/{taskId}/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('EMPLOYEE','SUPERVISOR', 'CLIENT')")
    public Object uploadTaskPhoto(
            @PathVariable Integer taskId,
            @RequestParam("file") MultipartFile file
    ) {
        if (file == null || file.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Image file is required");
        }

        Task task = taskRepository.findById(taskId).orElse(null);
        if (task == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Task not found");
        }

        String imagePath;
        try {
            byte[] bytes = file.getBytes();
            ImageInfo imageInfo = readImageInfo(bytes);
            String extension = resolveExtension(file.getOriginalFilename(), file.getContentType());
            String fileName = buildImageFileName(taskId, imageInfo, bytes.length, extension, bytes);

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

        Photo photo = new Photo();
        photo.setTask(task);
        photo.setImg(imagePath);

        Photo saved = photoRepository.save(photo);
        return toTaskPhotoResponse(saved);
    }

    @GetMapping("/task/{taskId}")
    public Object getTaskPhotos(@PathVariable Integer taskId) {
        return photoRepository.findByTask_IdTask(taskId)
                .stream()
                .map(this::toTaskPhotoResponse)
                .toList();
    }

    @PostMapping("/item")
    @PreAuthorize("isAuthenticated()")
    public Object addItemPhoto(
            @Valid @RequestBody ItemPhotoRequest request
    ) {
        Integer itemId = request.getItemId();
        String img = request.getImg();
        String title = request.getTitle();

        Item item = itemRepository.findById(itemId).orElse(null);

        if (item == null) {
            return "Item not found";
        }

        ItemPhoto photo = new ItemPhoto();
        photo.setItem(item);
        photo.setImg(img);
        photo.setTitle(title);

        ItemPhoto saved = itemPhotoRepository.save(photo);

        Map<String, Object> response = new HashMap<>();
        response.put("idItemPhoto", saved.getIdItemPhoto());
        response.put("itemId", saved.getItem().getIdItem());
        response.put("title", saved.getTitle());
        response.put("img", saved.getImg());

        return response;
    }

    @GetMapping("/item/{itemId}")
    public Object getItemPhotos(@PathVariable Integer itemId) {
        return itemPhotoRepository.findByItem_IdItem(itemId);
    }

    private Map<String, Object> toTaskPhotoResponse(Photo photo) {
        Map<String, Object> response = new HashMap<>();
        response.put("idPhoto", photo.getIdPhoto());
        response.put("taskId", photo.getTask().getIdTask());
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

    private String buildImageFileName(
            Integer taskId,
            ImageInfo imageInfo,
            int fileSize,
            String extension,
            byte[] bytes
    ) {
        String hash = sha256(bytes).substring(0, 12);
        return "task_" + taskId
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
