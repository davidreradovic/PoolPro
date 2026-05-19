package com.example.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "supervisor")
public class Supervisor {
    @Id
    @Column(name = "id_supervisor")
    private Integer idSupervisor;

    // DODATO: cascade = CascadeType.ALL govori Hibernate-u da sačuva User-a 
    // u isto vreme kada čuva i Supervisor-a
    @OneToOne(cascade = CascadeType.ALL) 
    @MapsId
    @JoinColumn(name = "id_supervisor")
    private User user;

    public Integer getIdSupervisor() { return idSupervisor; }
    public void setIdSupervisor(Integer idSupervisor) { this.idSupervisor = idSupervisor; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
}
