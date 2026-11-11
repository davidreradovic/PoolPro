package com.example.backend.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "order_has_item")
public class OrderHasItem {
    @EmbeddedId
    private OrderHasItemId id;

    @ManyToOne(optional = false)
    @MapsId("idOrder")
    @JoinColumn(name = "id_order")
    private Order order;

    @ManyToOne(optional = false)
    @MapsId("idItem")
    @JoinColumn(name = "id_item")
    private Item item;

    @Column(nullable = false)
    private Integer quantity;

    @Column(precision = 10, scale = 2)
    private BigDecimal price;

    public OrderHasItemId getId() { return id; }
    public void setId(OrderHasItemId id) { this.id = id; }
    public Order getOrder() { return order; }
    public void setOrder(Order order) { this.order = order; }
    public Item getItem() { return item; }
    public void setItem(Item item) { this.item = item; }
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
}
