package com.example.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "client")
public class Client {

    @Id
    @Column(name = "id_client")
    private Integer idClient;

    @OneToOne
    @MapsId
    @JoinColumn(name = "id_client")
    private User user;

    public Integer getIdClient() { return idClient; }
    public void setIdClient(Integer idClient) { this.idClient = idClient; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
}