package com.example.backend.entity;

import jakarta.persistence.*;
import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class CartHasItemId implements Serializable {
    @Column(name = "id_cart")
    private Integer idCart;

    @Column(name = "id_item")
    private Integer idItem;

    public CartHasItemId() {}
    public CartHasItemId(Integer idCart, Integer idItem) { this.idCart = idCart; this.idItem = idItem; }
    public Integer getIdCart() { return idCart; }
    public void setIdCart(Integer idCart) { this.idCart = idCart; }
    public Integer getIdItem() { return idItem; }
    public void setIdItem(Integer idItem) { this.idItem = idItem; }
    @Override public boolean equals(Object o) { if (this == o) return true; if (!(o instanceof CartHasItemId that)) return false; return Objects.equals(idCart, that.idCart) && Objects.equals(idItem, that.idItem); }
    @Override public int hashCode() { return Objects.hash(idCart, idItem); }
}
