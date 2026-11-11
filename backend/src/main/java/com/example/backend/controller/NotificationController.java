package com.example.backend.controller;

import com.example.backend.repository.ItemRepository;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {

    private final ItemRepository itemRepository;

    public NotificationController(ItemRepository itemRepository) {
        this.itemRepository = itemRepository;
    }

    @GetMapping("/supervisor")
    @PreAuthorize("hasRole('SUPERVISOR')")
    public Object getSupervisorNotifications() {
        return Map.of(
                "lowStockItems", itemRepository.findByQuantity(0)
                        .stream()
                        .map(item -> Map.of(
                                "idItem", item.getIdItem(),
                                "title", item.getTitle(),
                                "quantity", item.getQuantity(),
                                "category", item.getCategory()
                        ))
                        .toList()
        );
    }
}
