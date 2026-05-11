package com.example.backend.controller;

import com.example.backend.entity.Message;
import com.example.backend.entity.User;
import com.example.backend.repository.ClientRepository;
import com.example.backend.repository.MessageRepository;
import com.example.backend.repository.SupervisorRepository;
import com.example.backend.repository.UserRepository;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/messages")
@CrossOrigin(origins = "*")
public class MessageController {

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final ClientRepository clientRepository;
    private final SupervisorRepository supervisorRepository;

    public MessageController(
            MessageRepository messageRepository,
            UserRepository userRepository,
            ClientRepository clientRepository,
            SupervisorRepository supervisorRepository
    ) {
        this.messageRepository = messageRepository;
        this.userRepository = userRepository;
        this.clientRepository = clientRepository;
        this.supervisorRepository = supervisorRepository;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('CLIENT', 'SUPERVISOR')")
    public Object sendMessage(
            @RequestBody Map<String, Object> request,
            Authentication authentication
    ) {
        String username = authentication.getName();

        User sender = userRepository.findByUsername(username).orElse(null);

        if (sender == null) {
            return "Sender not found";
        }

        Integer receiverId = (Integer) request.get("receiverId");
        String content = (String) request.get("content");

        User receiver = userRepository.findById(receiverId).orElse(null);

        if (receiver == null) {
            return "Receiver not found";
        }

        if (content == null || content.trim().isEmpty()) {
            return "Message content is required";
        }

        boolean senderIsClient = clientRepository.existsById(sender.getIdUser());
        boolean senderIsSupervisor = supervisorRepository.existsById(sender.getIdUser());

        boolean receiverIsClient = clientRepository.existsById(receiver.getIdUser());
        boolean receiverIsSupervisor = supervisorRepository.existsById(receiver.getIdUser());

        if (!((senderIsClient && receiverIsSupervisor) ||
                (senderIsSupervisor && receiverIsClient))) {
            return "Messages are allowed only between client and supervisor";
        }

        Message message = new Message();
        message.setSender(sender);
        message.setReceiver(receiver);
        message.setContent(content);
        message.setIsRead(false);

        Message saved = messageRepository.save(message);

        return Map.of(
                "idMessage", saved.getIdMessage(),
                "content", saved.getContent(),
                "timestamp", saved.getTimestamp(),
                "isRead", saved.getIsRead(),
                "senderId", saved.getSender().getIdUser(),
                "senderName", saved.getSender().getFirstName() + " " + saved.getSender().getLastName(),
                "receiverId", saved.getReceiver().getIdUser(),
                "receiverName", saved.getReceiver().getFirstName() + " " + saved.getReceiver().getLastName()
        );
    }

    @GetMapping("/conversation")
    @PreAuthorize("hasAnyRole('CLIENT', 'SUPERVISOR')")
    public Object getConversation(
            @RequestParam Integer user1Id,
            @RequestParam Integer user2Id
    ) {
        boolean user1IsClient = clientRepository.existsById(user1Id);
        boolean user1IsSupervisor = supervisorRepository.existsById(user1Id);

        boolean user2IsClient = clientRepository.existsById(user2Id);
        boolean user2IsSupervisor = supervisorRepository.existsById(user2Id);

        if (!((user1IsClient && user2IsSupervisor) ||
                (user1IsSupervisor && user2IsClient))) {
            return "Conversation is allowed only between client and supervisor";
        }

        var messages1 = messageRepository
                .findBySender_IdUserAndReceiver_IdUserOrderByTimestampAsc(user1Id, user2Id);

        var messages2 = messageRepository
                .findBySender_IdUserAndReceiver_IdUserOrderByTimestampAsc(user2Id, user1Id);

        messages1.addAll(messages2);

        return messages1.stream()
                .sorted((m1, m2) -> m1.getTimestamp().compareTo(m2.getTimestamp()))
                .map(message -> Map.of(
                        "idMessage", message.getIdMessage(),
                        "senderId", message.getSender().getIdUser(),
                        "senderName", message.getSender().getFirstName() + " " + message.getSender().getLastName(),
                        "receiverId", message.getReceiver().getIdUser(),
                        "receiverName", message.getReceiver().getFirstName() + " " + message.getReceiver().getLastName(),
                        "content", message.getContent(),
                        "timestamp", message.getTimestamp(),
                        "isRead", message.getIsRead()
                ))
                .toList();
    }

    @GetMapping("/unread/{userId}")
    @PreAuthorize("hasAnyRole('CLIENT', 'SUPERVISOR')")
    public Object getUnreadMessages(@PathVariable Integer userId) {
        return messageRepository.findByReceiver_IdUserAndIsReadFalse(userId)
                .stream()
                .map(message -> Map.of(
                        "idMessage", message.getIdMessage(),
                        "senderId", message.getSender().getIdUser(),
                        "senderName", message.getSender().getFirstName() + " " + message.getSender().getLastName(),
                        "content", message.getContent(),
                        "timestamp", message.getTimestamp()
                ))
                .toList();
    }

    @PutMapping("/{id}/read")
    @PreAuthorize("hasAnyRole('CLIENT', 'SUPERVISOR')")
    public Object markAsRead(@PathVariable Integer id) {
        Message message = messageRepository.findById(id).orElse(null);

        if (message == null) {
            return "Message not found";
        }

        message.setIsRead(true);

        Message saved = messageRepository.save(message);

        return Map.of(
                "idMessage", saved.getIdMessage(),
                "isRead", saved.getIsRead()
        );
    }
}