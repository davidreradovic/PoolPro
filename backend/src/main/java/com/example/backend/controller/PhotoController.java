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
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/photos")
@CrossOrigin(origins = "*")
public class PhotoController {

    private final PhotoRepository photoRepository;
    private final TaskRepository taskRepository;
    private final ItemPhotoRepository itemPhotoRepository;
    private final ItemRepository itemRepository;

    public PhotoController(
            PhotoRepository photoRepository,
            TaskRepository taskRepository,
            ItemPhotoRepository itemPhotoRepository,
            ItemRepository itemRepository
    ) {
        this.photoRepository = photoRepository;
        this.taskRepository = taskRepository;
        this.itemPhotoRepository = itemPhotoRepository;
        this.itemRepository = itemRepository;
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

        return response;
    }

    @GetMapping("/task/{taskId}")
    public Object getTaskPhotos(@PathVariable Integer taskId) {
        return photoRepository.findByTask_IdTask(taskId);
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
}
