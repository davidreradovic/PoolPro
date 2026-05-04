package com.example.backend.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "project")
public class Project {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_project")
    private Integer idProject;

    @Column(name = "is_public", nullable = false)
    private Boolean publicProject = false;

    @ManyToOne(optional = false)
    @JoinColumn(name = "id_supervisor")
    private Supervisor supervisor;

    @ManyToOne(optional = false)
    @JoinColumn(name = "id_client")
    private Client client;

    @Column(nullable = false, length = 100)
    private String title;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ProjectStatus status = ProjectStatus.todo;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "client_review", precision = 10, scale = 2)
    private BigDecimal clientReview;

    @Lob
    @Column(name = "review_text", columnDefinition = "TEXT")
    private String reviewText;

    public enum ProjectStatus {
        todo,
        in_progress,
        done,
        cancelled
    }

    public Integer getIdProject() { return idProject; }
    public void setIdProject(Integer idProject) { this.idProject = idProject; }
    public Boolean getPublicProject() { return publicProject; }
    public void setPublicProject(Boolean publicProject) { this.publicProject = publicProject; }
    public Supervisor getSupervisor() { return supervisor; }
    public void setSupervisor(Supervisor supervisor) { this.supervisor = supervisor; }
    public Client getClient() { return client; }
    public void setClient(Client client) { this.client = client; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public ProjectStatus getStatus() { return status; }
    public void setStatus(ProjectStatus status) { this.status = status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public BigDecimal getClientReview() { return clientReview; }
    public void setClientReview(BigDecimal clientReview) { this.clientReview = clientReview; }
    public String getReviewText() { return reviewText; }
    public void setReviewText(String reviewText) { this.reviewText = reviewText; }
}
