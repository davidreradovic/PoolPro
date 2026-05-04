package com.example.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "message")
public class Message {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) @Column(name = "id_message")
    private Integer idMessage;
    @ManyToOne(optional = false) @JoinColumn(name = "id_sender")
    private User sender;
    @ManyToOne(optional = false) @JoinColumn(name = "id_receiver")
    private User receiver;
    @Column(nullable = false, length = 500)
    private String content;
    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;
    public Integer getIdMessage() { return idMessage; } public void setIdMessage(Integer idMessage) { this.idMessage = idMessage; }
    public User getSender() { return sender; } public void setSender(User sender) { this.sender = sender; }
    public User getReceiver() { return receiver; } public void setReceiver(User receiver) { this.receiver = receiver; }
    public String getContent() { return content; } public void setContent(String content) { this.content = content; }
    public LocalDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
