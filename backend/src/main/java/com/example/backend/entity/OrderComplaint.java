package com.example.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "order_complaint")
public class OrderComplaint {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_order_complaint")
    private Integer idOrderComplaint;

    @Lob
    @Column(nullable = false, columnDefinition = "TEXT")
    private String comment;

    @Column(name = "timestamp", insertable = false, updatable = false)
    private LocalDateTime timestamp;

    @ManyToOne(optional = false)
    @JoinColumn(name = "order_id_order")
    private Order order;

    public Integer getIdOrderComplaint() { return idOrderComplaint; }
    public void setIdOrderComplaint(Integer idOrderComplaint) { this.idOrderComplaint = idOrderComplaint; }
    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
    public Order getOrder() { return order; }
    public void setOrder(Order order) { this.order = order; }
}
