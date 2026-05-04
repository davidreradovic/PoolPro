package com.example.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "project_complaint")
public class ProjectComplaint {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) @Column(name = "id_project_complaint")
    private Integer idProjectComplaint;
    @Column(nullable = false, length = 255)
    private String comment;
    @Column(nullable = false)
    private LocalDate date;
    @ManyToOne(optional = false) @JoinColumn(name = "id_project")
    private Project project;
    public Integer getIdProjectComplaint() { return idProjectComplaint; } public void setIdProjectComplaint(Integer idProjectComplaint) { this.idProjectComplaint = idProjectComplaint; }
    public String getComment() { return comment; } public void setComment(String comment) { this.comment = comment; }
    public LocalDate getDate() { return date; } public void setDate(LocalDate date) { this.date = date; }
    public Project getProject() { return project; } public void setProject(Project project) { this.project = project; }
}
