package com.example.backend.entity;

import jakarta.persistence.*;
import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class ItemReviewId implements Serializable {
    @Column(name = "client_id_client")
    private Integer clientIdClient;

    @Column(name = "item_id_item")
    private Integer itemIdItem;

    public ItemReviewId() {}
    public ItemReviewId(Integer clientIdClient, Integer itemIdItem) {
        this.clientIdClient = clientIdClient;
        this.itemIdItem = itemIdItem;
    }
    public Integer getClientIdClient() { return clientIdClient; }
    public void setClientIdClient(Integer clientIdClient) { this.clientIdClient = clientIdClient; }
    public Integer getItemIdItem() { return itemIdItem; }
    public void setItemIdItem(Integer itemIdItem) { this.itemIdItem = itemIdItem; }
    @Override public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof ItemReviewId that)) return false;
        return Objects.equals(clientIdClient, that.clientIdClient) && Objects.equals(itemIdItem, that.itemIdItem);
    }
    @Override public int hashCode() { return Objects.hash(clientIdClient, itemIdItem); }
}
