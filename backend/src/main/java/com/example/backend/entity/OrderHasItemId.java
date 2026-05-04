package com.example.backend.entity;

import jakarta.persistence.*;
import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class OrderHasItemId implements Serializable {
    @Column(name = "id_order")
    private Integer idOrder;

    @Column(name = "id_item")
    private Integer idItem;

    public OrderHasItemId() {}
    public OrderHasItemId(Integer idOrder, Integer idItem) { this.idOrder = idOrder; this.idItem = idItem; }
    public Integer getIdOrder() { return idOrder; }
    public void setIdOrder(Integer idOrder) { this.idOrder = idOrder; }
    public Integer getIdItem() { return idItem; }
    public void setIdItem(Integer idItem) { this.idItem = idItem; }
    @Override public boolean equals(Object o) { if (this == o) return true; if (!(o instanceof OrderHasItemId that)) return false; return Objects.equals(idOrder, that.idOrder) && Objects.equals(idItem, that.idItem); }
    @Override public int hashCode() { return Objects.hash(idOrder, idItem); }
}
