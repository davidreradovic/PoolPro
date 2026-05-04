package com.example.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "item_comment")
public class ItemComment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_item_comment")
    private Integer idItemComment;

    @ManyToOne
    @JoinColumn(name = "id_reply")
    private ItemComment reply;

    @ManyToOne(optional = false)
    @JoinColumn(name = "id_item")
    private Item item;

    @Lob
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @ManyToOne(optional = false)
    @JoinColumn(name = "id_user")
    private User user;

    @Column(name = "timestamp", insertable = false, updatable = false)
    private LocalDateTime timestamp;

    public Integer getIdItemComment() { return idItemComment; }
    public void setIdItemComment(Integer idItemComment) { this.idItemComment = idItemComment; }
    public ItemComment getReply() { return reply; }
    public void setReply(ItemComment reply) { this.reply = reply; }
    public Item getItem() { return item; }
    public void setItem(Item item) { this.item = item; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}
