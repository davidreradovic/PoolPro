package com.example.backend.controller;

import com.example.backend.dto.CreateReviewRequest;
import com.example.backend.entity.*;
import com.example.backend.repository.*;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = "*")
public class ReviewController {

    private final ItemReviewRepository itemReviewRepository;
    private final ClientRepository clientRepository;
    private final ItemRepository itemRepository;

    public ReviewController(
            ItemReviewRepository itemReviewRepository,
            ClientRepository clientRepository,
            ItemRepository itemRepository
    ) {
        this.itemReviewRepository = itemReviewRepository;
        this.clientRepository = clientRepository;
        this.itemRepository = itemRepository;
    }

    @PostMapping
    @PreAuthorize("hasRole('CLIENT')")
    public Object createReview(
            @Valid @RequestBody CreateReviewRequest request,
            Principal principal
    ) {
        Integer clientId = request.getClientId();
        Integer itemId = request.getItemId();
        BigDecimal review = request.getReview();
        String description = request.getDescription();

        Client client = clientRepository.findById(clientId).orElse(null);

        if (client == null) {
            return "Client not found";
        }

        if (!client.getUser().getUsername().equals(principal.getName())) {
            return "You can only create your own review";
        }

        Item item = itemRepository.findById(itemId).orElse(null);

        if (item == null) {
            return "Item not found";
        }

        ItemReviewId id = new ItemReviewId(clientId, itemId);

        if (itemReviewRepository.existsById(id)) {
            return "Review already exists";
        }

        ItemReview itemReview = new ItemReview();
        itemReview.setId(id);
        itemReview.setClient(client);
        itemReview.setItem(item);
        itemReview.setReview(review);
        itemReview.setDescription(description);

        ItemReview saved = itemReviewRepository.save(itemReview);

        Map<String, Object> response = new HashMap<>();
        response.put("clientId", saved.getClient().getIdClient());
        response.put("itemId", saved.getItem().getIdItem());
        response.put("review", saved.getReview());
        response.put("description", saved.getDescription());

        return response;
    }

    @PutMapping
    @PreAuthorize("hasRole('CLIENT')")
    public Object updateReview(
            @Valid @RequestBody CreateReviewRequest request,
            Principal principal
    ) {
        Integer clientId = request.getClientId();
        Integer itemId = request.getItemId();

        ItemReviewId id = new ItemReviewId(clientId, itemId);
        ItemReview itemReview = itemReviewRepository.findById(id).orElse(null);

        if (itemReview == null) {
            return "Review not found";
        }

        if (!itemReview.getClient().getUser().getUsername().equals(principal.getName())) {
            return "You can only update your own review";
        }

        itemReview.setReview(request.getReview());
        itemReview.setDescription(request.getDescription());

        ItemReview saved = itemReviewRepository.save(itemReview);

        Map<String, Object> response = new HashMap<>();
        response.put("clientId", saved.getClient().getIdClient());
        response.put("itemId", saved.getItem().getIdItem());
        response.put("review", saved.getReview());
        response.put("description", saved.getDescription());

        return response;
    }

    @GetMapping("/item/{itemId}")
    public Object getReviewsForItem(@PathVariable Integer itemId) {
        return itemReviewRepository.findByItem_IdItem(itemId)
                .stream()
                .map(review -> {
                    Map<String, Object> response = new HashMap<>();
                    response.put("clientId", review.getClient().getIdClient());
                    response.put("clientUsername", review.getClient().getUser().getUsername());
                    response.put("review", review.getReview());
                    response.put("description", review.getDescription());
                    return response;
                })
                .toList();
    }

    @GetMapping("/client/{clientId}")
    @PreAuthorize("hasRole('CLIENT')")
    public Object getReviewsByClient(@PathVariable Integer clientId) {
        return itemReviewRepository.findByClient_IdClient(clientId)
                .stream()
                .map(review -> {
                    Map<String, Object> response = new HashMap<>();
                    response.put("itemId", review.getItem().getIdItem());
                    response.put("itemTitle", review.getItem().getTitle());
                    response.put("review", review.getReview());
                    response.put("description", review.getDescription());
                    return response;
                })
                .toList();
    }
}
