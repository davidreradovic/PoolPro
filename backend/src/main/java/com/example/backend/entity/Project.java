package com.example.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "project")
public class Project {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_project")
    private Integer idProject;

    @Column(name = "public", nullable = false)
    private Boolean publicProject;

    @ManyToOne(optional = false)
    @JoinColumn(name = "id_supervisor")
    private Supervisor supervisor;

    @ManyToOne(optional = false)
    @JoinColumn(name = "id_client")
    private Client client;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    public Integer getIdProject() { return idProject; }
    public void setIdProject(Integer idProject) { this.idProject = idProject; }
    public Boolean getPublicProject() { return publicProject; }
    public void setPublicProject(Boolean publicProject) { this.publicProject = publicProject; }
    public Supervisor getSupervisor() { return supervisor; }
    public void setSupervisor(Supervisor supervisor) { this.supervisor = supervisor; }
    public Client getClient() { return client; }
    public void setClient(Client client) { this.client = client; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
