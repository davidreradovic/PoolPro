package com.example.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "cart")
public class Cart {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_cart")
    private Integer idCart;

    @ManyToOne(optional = false)
    @JoinColumn(name = "id_client")
    private Client client;

    public Integer getIdCart() { return idCart; }
    public void setIdCart(Integer idCart) { this.idCart = idCart; }
    public Client getClient() { return client; }
    public void setClient(Client client) { this.client = client; }
}
