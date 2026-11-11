package com.example.backend.controller;

import com.example.backend.dto.SendMessageRequest;
import com.example.backend.entity.Message;
import com.example.backend.entity.User;
import com.example.backend.repository.ClientRepository;
import com.example.backend.repository.EmployeeRepository;
import com.example.backend.repository.MessageRepository;
import com.example.backend.repository.SupervisorRepository;
import com.example.backend.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashSet;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/messages")
@CrossOrigin(origins = "*")
public class MessageController {

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final ClientRepository clientRepository;
    private final EmployeeRepository employeeRepository;
    private final SupervisorRepository supervisorRepository;

    public MessageController(
            MessageRepository messageRepository,
            UserRepository userRepository,
            ClientRepository clientRepository,
            EmployeeRepository employeeRepository,
            SupervisorRepository supervisorRepository
    ) {
        this.messageRepository = messageRepository;
        this.userRepository = userRepository;
        this.clientRepository = clientRepository;
        this.employeeRepository = employeeRepository;
        this.supervisorRepository = supervisorRepository;
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public Object sendMessage(
            @Valid @RequestBody SendMessageRequest request,
            Authentication authentication
    ) {
        String username = authentication.getName();
        User sender = userRepository.findByUsername(username).orElse(null);

        if (sender == null) {
            return "Sender not found";
        }

        Integer receiverId = request.getReceiverId();
        String content = request.getContent();

        User receiver = userRepository.findById(receiverId).orElse(null);

        if (receiver == null) {
            return "Receiver not found";
        }

        if (!canSendMessage(sender, receiver)) {
            return "You are not allowed to send messages to this user";
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
    @PreAuthorize("isAuthenticated()")
    public Object getConversation(
            @RequestParam Integer user1Id,
            @RequestParam Integer user2Id,
            Authentication authentication
    ) {
        User currentUser = userRepository.findByUsername(authentication.getName()).orElse(null);
        User user1 = userRepository.findById(user1Id).orElse(null);
        User user2 = userRepository.findById(user2Id).orElse(null);

        if (currentUser == null || user1 == null || user2 == null) {
            return "User not found";
        }

        if (!currentUser.getIdUser().equals(user1Id) && !currentUser.getIdUser().equals(user2Id)) {
            return "You can only view your own conversations";
        }

        if (!canOpenConversation(user1, user2)) {
            return "Conversation is not allowed between these users";
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

    @GetMapping("/contacts")
    @PreAuthorize("isAuthenticated()")
    public Object getExistingContacts(Authentication authentication) {
        User currentUser = userRepository.findByUsername(authentication.getName()).orElse(null);

        if (currentUser == null) {
            return List.of();
        }

        Set<Integer> partnerIds = new HashSet<>();
        Map<Integer, LocalDateTime> latestMessageByPartner = new HashMap<>();
        messageRepository
                .findBySender_IdUserOrReceiver_IdUser(currentUser.getIdUser(), currentUser.getIdUser())
                .forEach(message -> {
                    Integer senderId = message.getSender().getIdUser();
                    Integer receiverId = message.getReceiver().getIdUser();
                    Integer partnerId = senderId.equals(currentUser.getIdUser()) ? receiverId : senderId;
                    partnerIds.add(partnerId);
                    latestMessageByPartner.merge(
                            partnerId,
                            message.getTimestamp(),
                            (currentLatest, nextTimestamp) ->
                                    nextTimestamp != null && (currentLatest == null || nextTimestamp.isAfter(currentLatest))
                                            ? nextTimestamp
                                            : currentLatest
                    );
                });

        return partnerIds.stream()
                .map(id -> userRepository.findById(id).orElse(null))
                .filter(partner -> partner != null && partner.getStatus() == User.UserStatus.active)
                .filter(partner -> canOpenConversation(currentUser, partner))
                .sorted((a, b) -> {
                    LocalDateTime latestA = latestMessageByPartner.get(a.getIdUser());
                    LocalDateTime latestB = latestMessageByPartner.get(b.getIdUser());

                    if (latestA == null && latestB == null) {
                        return a.getUsername().compareToIgnoreCase(b.getUsername());
                    }

                    if (latestA == null) return 1;
                    if (latestB == null) return -1;
                    return latestB.compareTo(latestA);
                })
                .map(this::createRecipientMap)
                .toList();
    }

    @GetMapping("/unread/{userId}")
    @PreAuthorize("isAuthenticated()")
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
    @PreAuthorize("isAuthenticated()")
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

    private boolean isSupervisor(User user) {
        return supervisorRepository.existsByUser_IdUser(user.getIdUser());
    }

    private boolean isEmployee(User user) {
        return employeeRepository.existsByUser_IdUser(user.getIdUser());
    }

    private boolean isClient(User user) {
        return clientRepository.existsByUser_IdUser(user.getIdUser());
    }

    private boolean canSendMessage(User sender, User receiver) {
        if (sender.getIdUser().equals(receiver.getIdUser())) {
            return false;
        }

        if (isSupervisor(sender)) {
            return receiver.getStatus() == User.UserStatus.active;
        }

        if (isEmployee(sender) || isClient(sender)) {
            return isSupervisor(receiver) && receiver.getStatus() == User.UserStatus.active;
        }

        return false;
    }

    private boolean canOpenConversation(User user1, User user2) {
        return canSendMessage(user1, user2) || canSendMessage(user2, user1);
    }

    private Map<String, Object> createRecipientMap(User user) {
        return Map.of(
                "idUser", user.getIdUser(),
                "username", user.getUsername(),
                "firstName", user.getFirstName(),
                "lastName", user.getLastName(),
                "email", user.getEmail(),
                "role", getRole(user)
        );
    }

    private String getRole(User user) {
        if (isSupervisor(user)) {
            return "SUPERVISOR";
        }
        if (isEmployee(user)) {
            return "EMPLOYEE";
        }
        return "CLIENT";
    }
}
