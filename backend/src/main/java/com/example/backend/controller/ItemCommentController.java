package com.example.backend.controller;

import com.example.backend.dto.CreateItemCommentRequest;
import com.example.backend.entity.Item;
import com.example.backend.entity.ItemComment;
import com.example.backend.entity.User;
import com.example.backend.repository.ItemCommentRepository;
import com.example.backend.repository.ItemRepository;
import com.example.backend.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/item-comments")
@CrossOrigin(origins = "*")
public class ItemCommentController {

    private final ItemCommentRepository itemCommentRepository;
    private final ItemRepository itemRepository;
    private final UserRepository userRepository;

    public ItemCommentController(
            ItemCommentRepository itemCommentRepository,
            ItemRepository itemRepository,
            UserRepository userRepository
    ) {
        this.itemCommentRepository = itemCommentRepository;
        this.itemRepository = itemRepository;
        this.userRepository = userRepository;
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public Object createComment(
            @Valid @RequestBody CreateItemCommentRequest request,
            Authentication authentication
    ) {
        String username = authentication.getName();
        User user = userRepository.findByUsername(username).orElse(null);

        if (user == null) {
            return "User not found";
        }

        Integer itemId = request.getItemId();
        Integer replyId = request.getReplyId();
        String content = request.getContent();

        Item item = itemRepository.findById(itemId).orElse(null);
        if (item == null) {
            return "Item not found";
        }

        ItemComment reply = null;
        if (replyId != null) {
            reply = itemCommentRepository.findById(replyId).orElse(null);

            if (reply == null) {
                return "Reply comment not found";
            }
        }

        ItemComment comment = new ItemComment();
        comment.setItem(item);
        comment.setUser(user);
        comment.setContent(content);
        comment.setReply(reply);

        ItemComment saved = itemCommentRepository.save(comment);
        saved = itemCommentRepository.findById(saved.getIdItemComment()).orElse(saved);

        Map<String, Object> response = new HashMap<>();
        response.put("idItemComment", saved.getIdItemComment());
        response.put("itemId", saved.getItem().getIdItem());
        response.put("userId", saved.getUser().getIdUser());
        response.put("username", saved.getUser().getUsername());
        response.put("content", saved.getContent());
        response.put("timestamp", saved.getTimestamp());

        if (saved.getReply() != null) {
            response.put("replyId", saved.getReply().getIdItemComment());
        }

        return response;
    }

    @GetMapping("/item/{itemId}")
    public Object getCommentsByItem(@PathVariable Integer itemId) {
        return itemCommentRepository.findByItem_IdItem(itemId)
                .stream()
                .map(comment -> {
                    Map<String, Object> response = new HashMap<>();
                    response.put("idItemComment", comment.getIdItemComment());
                    response.put("content", comment.getContent());
                    response.put("timestamp", comment.getTimestamp());
                    response.put("userId", comment.getUser().getIdUser());
                    response.put("username", comment.getUser().getUsername());

                    if (comment.getReply() != null) {
                        response.put("replyId", comment.getReply().getIdItemComment());
                    }

                    return response;
                })
                .toList();
    }
}
