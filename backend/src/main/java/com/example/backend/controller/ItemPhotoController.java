package com.example.backend.controller;

import com.example.backend.entity.Item;
import com.example.backend.entity.ItemPhoto;
import com.example.backend.repository.ItemPhotoRepository;
import com.example.backend.repository.ItemRepository;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/item-photos")
@CrossOrigin(origins = "*")
public class ItemPhotoController {

    private final ItemPhotoRepository itemPhotoRepository;
    private final ItemRepository itemRepository;

    public ItemPhotoController(
            ItemPhotoRepository itemPhotoRepository,
            ItemRepository itemRepository
    ) {
        this.itemPhotoRepository = itemPhotoRepository;
        this.itemRepository = itemRepository;
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

    @GetMapping("/item/{itemId}")
    public Object getItemPhotos(
            @PathVariable Integer itemId
    ) {

        return itemPhotoRepository
                .findByItem_IdItem(itemId)
                .stream()
                .map(photo->{

                    Map<String,Object> response =
                            new HashMap<>();

                    response.put(
                            "idItemPhoto",
                            photo.getIdItemPhoto()
                    );

                    response.put(
                            "title",
                            photo.getTitle()
                    );

                    response.put(
                            "img",
                            photo.getImg()
                    );

                    return response;

                }).toList();
    }

}