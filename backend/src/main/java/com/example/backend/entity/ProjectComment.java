package com.example.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "project_comment")
public class ProjectComment {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) @Column(name = "id_project_comment")
    private Integer idProjectComment;
    @ManyToOne @JoinColumn(name = "id_reply")
    private ProjectComment reply;
    @ManyToOne(optional = false) @JoinColumn(name = "id_project")
    private Project project;
    @Column(nullable = false, length = 255)
    private String content;
    @ManyToOne(optional = false) @JoinColumn(name = "id_user")
    private User user;
    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;
    public Integer getIdProjectComment() { return idProjectComment; } public void setIdProjectComment(Integer idProjectComment) { this.idProjectComment = idProjectComment; }
    public ProjectComment getReply() { return reply; } public void setReply(ProjectComment reply) { this.reply = reply; }
    public Project getProject() { return project; } public void setProject(Project project) { this.project = project; }
    public String getContent() { return content; } public void setContent(String content) { this.content = content; }
    public User getUser() { return user; } public void setUser(User user) { this.user = user; }
    public LocalDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
