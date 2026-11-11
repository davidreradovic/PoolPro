package com.example.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "project_complaint")
public class ProjectComplaint {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_project_complaint")
    private Integer idProjectComplaint;

    @Lob
    @Column(nullable = false, columnDefinition = "TEXT")
    private String comment;

    @Column(name = "timestamp", insertable = false, updatable = false)
    private LocalDateTime timestamp;

    @ManyToOne(optional = false)
    @JoinColumn(name = "id_project")
    private Project project;

    public Integer getIdProjectComplaint() { return idProjectComplaint; }
    public void setIdProjectComplaint(Integer idProjectComplaint) { this.idProjectComplaint = idProjectComplaint; }
    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
    public Project getProject() { return project; }
    public void setProject(Project project) { this.project = project; }
}
