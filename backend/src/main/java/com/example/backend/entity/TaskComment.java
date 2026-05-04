package com.example.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "task_comment")
public class TaskComment {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) @Column(name = "id_task_comment")
    private Integer idTaskComment;
    @ManyToOne(optional = false) @JoinColumn(name = "id_task")
    private Task task;
    @ManyToOne @JoinColumn(name = "id_reply")
    private TaskComment reply;
    @Column(nullable = false, length = 255)
    private String content;
    @ManyToOne(optional = false) @JoinColumn(name = "id_user")
    private User user;
    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;
    public Integer getIdTaskComment() { return idTaskComment; } public void setIdTaskComment(Integer idTaskComment) { this.idTaskComment = idTaskComment; }
    public Task getTask() { return task; } public void setTask(Task task) { this.task = task; }
    public TaskComment getReply() { return reply; } public void setReply(TaskComment reply) { this.reply = reply; }
    public String getContent() { return content; } public void setContent(String content) { this.content = content; }
    public User getUser() { return user; } public void setUser(User user) { this.user = user; }
    public LocalDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
