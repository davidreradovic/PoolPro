package com.example.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "supervisor")
public class Supervisor {
    @Id
    @Column(name = "id_supervisor")
    private Integer idSupervisor;

    @OneToOne
    @MapsId
    @JoinColumn(name = "id_supervisor")
    private User user;

    public Integer getIdSupervisor() { return idSupervisor; }
    public void setIdSupervisor(Integer idSupervisor) { this.idSupervisor = idSupervisor; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
}