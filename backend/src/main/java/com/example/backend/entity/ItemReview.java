package com.example.backend.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "item_review")
public class ItemReview {
    @EmbeddedId
    private ItemReviewId id;

    @ManyToOne(optional = false)
    @MapsId("clientIdClient")
    @JoinColumn(name = "client_id_client")
    private Client client;

    @ManyToOne(optional = false)
    @MapsId("itemIdItem")
    @JoinColumn(name = "item_id_item")
    private Item item;

    @Column(precision = 10, scale = 2)
    private BigDecimal review;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String description;

    public ItemReviewId getId() { return id; }
    public void setId(ItemReviewId id) { this.id = id; }
    public Client getClient() { return client; }
    public void setClient(Client client) { this.client = client; }
    public Item getItem() { return item; }
    public void setItem(Item item) { this.item = item; }
    public BigDecimal getReview() { return review; }
    public void setReview(BigDecimal review) { this.review = review; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
