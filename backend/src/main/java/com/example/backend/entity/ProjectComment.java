package com.example.backend.entity;
import java.time.LocalDateTime;
import jakarta.persistence.*;

@Entity
@Table(name = "project_comment")
public class ProjectComment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_project_comment")
    private Integer idProjectComment;

    @ManyToOne
    @JoinColumn(name = "id_reply")
    private ProjectComment reply;

    @ManyToOne(optional = false)
    @JoinColumn(name = "id_project")
    private Project project;

    @Lob
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @ManyToOne(optional = false)
    @JoinColumn(name = "id_user")
    private User user;

    @Column(
            name = "timestamp",
            insertable = false,
            updatable = false
    )
    private LocalDateTime timestamp;

    public Integer getIdProjectComment() { return idProjectComment; }
    public void setIdProjectComment(Integer idProjectComment) { this.idProjectComment = idProjectComment; }
    public ProjectComment getReply() { return reply; }
    public void setReply(ProjectComment reply) { this.reply = reply; }
    public Project getProject() { return project; }
    public void setProject(Project project) { this.project = project; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}
