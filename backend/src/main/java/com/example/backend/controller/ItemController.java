package com.example.backend.controller;

import com.example.backend.dto.CreateItemRequest;
import com.example.backend.entity.Item;
import com.example.backend.entity.ItemPhoto;
import com.example.backend.repository.ItemPhotoRepository;
import com.example.backend.repository.ItemRepository;
import com.example.backend.repository.OrderHasItemRepository;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/items")
@CrossOrigin(origins = "*")
public class ItemController {

    private final ItemRepository itemRepository;
    private final ItemPhotoRepository itemPhotoRepository;
    private final OrderHasItemRepository orderHasItemRepository;

    public ItemController(
            ItemRepository itemRepository,
            ItemPhotoRepository itemPhotoRepository,
            OrderHasItemRepository orderHasItemRepository
    ) {
        this.itemRepository = itemRepository;
        this.itemPhotoRepository = itemPhotoRepository;
        this.orderHasItemRepository = orderHasItemRepository;
    }

    @GetMapping
    public Object getAllItems() {
        return itemRepository.findAll()
                .stream()
                .map(this::toItemResponse)
                .toList();
    }

    @GetMapping("/featured")
    public Object getFeaturedItems() {
        List<Item> topSellingItems = orderHasItemRepository.findTopSellingItems();
        List<Item> items = topSellingItems.isEmpty() ? itemRepository.findAll() : topSellingItems;

        return items.stream()
                .limit(6)
                .map(this::toItemResponse)
                .toList();
    }

    @GetMapping("/{id}")
    public Object getItemById(@PathVariable Integer id) {
        Item item = itemRepository.findById(id).orElse(null);

        if (item == null) {
            return "Item not found";
        }

        return toItemResponse(item);
    }

    @PostMapping
    @PreAuthorize("hasRole('SUPERVISOR')")
    public Object createItem(@Valid @RequestBody CreateItemRequest request) {
        Item item = new Item();
        item.setTitle(request.getTitle());
        item.setQuantity(request.getQuantity());
        item.setUnitPrice(request.getUnitPrice());
        item.setCategory(request.getCategory());
        Item saved = itemRepository.save(item);

        return toItemResponse(saved);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('SUPERVISOR')")
    public Object updateItem(
            @PathVariable Integer id,
            @RequestBody Item updatedItem
    ) {
        Item item = itemRepository.findById(id).orElse(null);

        if (item == null) {
            return "Item not found";
        }

        if (updatedItem.getTitle() != null) {
            item.setTitle(updatedItem.getTitle());
        }

        if (updatedItem.getQuantity() != null) {
            item.setQuantity(updatedItem.getQuantity());
        }

        if (updatedItem.getUnitPrice() != null) {
            item.setUnitPrice(updatedItem.getUnitPrice());
        }

        if (updatedItem.getCategory() != null) {
            item.setCategory(updatedItem.getCategory());
        }

        Item saved = itemRepository.save(item);

        return toItemResponse(saved);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SUPERVISOR')")
    public Object deleteItem(@PathVariable Integer id) {
        Item item = itemRepository.findById(id).orElse(null);

        if (item == null) {
            return "Item not found";
        }

        itemRepository.delete(item);

        return "Item deleted successfully";
    }

    private Map<String, Object> toItemResponse(Item item) {
        Map<String, Object> response = new HashMap<>();
        response.put("idItem", item.getIdItem());
        response.put("title", item.getTitle());
        response.put("quantity", item.getQuantity());
        response.put("unitPrice", item.getUnitPrice());
        response.put("category", item.getCategory());

        itemPhotoRepository.findByItem_IdItem(item.getIdItem())
                .stream()
                .findFirst()
                .map(ItemPhoto::getImg)
                .ifPresent(img -> {
                    response.put("img", img);
                    response.put("imgUrl", publicImageUrl(img));
                });

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
}
