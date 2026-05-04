package com.example.backend.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "cart_has_item")
public class CartHasItem {
    @EmbeddedId
    private CartHasItemId id;

    @ManyToOne(optional = false)
    @MapsId("idCart")
    @JoinColumn(name = "id_cart")
    private Cart cart;

    @ManyToOne(optional = false)
    @MapsId("idItem")
    @JoinColumn(name = "id_item")
    private Item item;

    @Column(nullable = false)
    private Integer quantity;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    public CartHasItemId getId() { return id; }
    public void setId(CartHasItemId id) { this.id = id; }
    public Cart getCart() { return cart; }
    public void setCart(Cart cart) { this.cart = cart; }
    public Item getItem() { return item; }
    public void setItem(Item item) { this.item = item; }
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
}
