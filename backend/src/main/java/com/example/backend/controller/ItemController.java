package com.example.backend.controller;

import com.example.backend.entity.Item;
import com.example.backend.repository.ItemRepository;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/items")
@CrossOrigin(origins = "*")
public class ItemController {

    private final ItemRepository itemRepository;

    public ItemController(ItemRepository itemRepository) {
        this.itemRepository = itemRepository;
    }

    @GetMapping
    public Object getAllItems() {
        return itemRepository.findAll()
                .stream()
                .map(item -> Map.of(
                        "idItem", item.getIdItem(),
                        "title", item.getTitle(),
                        "quantity", item.getQuantity(),
                        "unitPrice", item.getUnitPrice(),
                        "category", item.getCategory()
                ))
                .toList();
    }

    @GetMapping("/{id}")
    public Object getItemById(@PathVariable Integer id) {
        Item item = itemRepository.findById(id).orElse(null);

        if (item == null) {
            return "Item not found";
        }

        return Map.of(
                "idItem", item.getIdItem(),
                "title", item.getTitle(),
                "quantity", item.getQuantity(),
                "unitPrice", item.getUnitPrice(),
                "category", item.getCategory()
        );
    }

    @PostMapping
    @PreAuthorize("hasRole('SUPERVISOR')")
    public Object createItem(@RequestBody Item item) {

        if (item.getTitle() == null || item.getTitle().trim().isEmpty()) {
            return "Title is required";
        }

        if (item.getQuantity() == null || item.getQuantity() < 0) {
            return "Quantity must be >= 0";
        }

        if (item.getUnitPrice() == null) {
            return "Unit price is required";
        }

        if (item.getCategory() == null || item.getCategory().trim().isEmpty()) {
            return "Category is required";
        }

        Item saved = itemRepository.save(item);

        return Map.of(
                "idItem", saved.getIdItem(),
                "title", saved.getTitle(),
                "quantity", saved.getQuantity(),
                "unitPrice", saved.getUnitPrice(),
                "category", saved.getCategory()
        );
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

        return Map.of(
                "idItem", saved.getIdItem(),
                "title", saved.getTitle(),
                "quantity", saved.getQuantity(),
                "unitPrice", saved.getUnitPrice(),
                "category", saved.getCategory()
        );
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
}