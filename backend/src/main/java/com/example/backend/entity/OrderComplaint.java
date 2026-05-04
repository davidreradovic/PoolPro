package com.example.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "order_complaint")
public class OrderComplaint {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) @Column(name = "id_order_complaint")
    private Integer idOrderComplaint;
    @Column(nullable = false, length = 255)
    private String comment;
    @Column(nullable = false)
    private LocalDate date;
    @ManyToOne(optional = false) @JoinColumn(name = "id_order")
    private Order order;
    public Integer getIdOrderComplaint() { return idOrderComplaint; } public void setIdOrderComplaint(Integer idOrderComplaint) { this.idOrderComplaint = idOrderComplaint; }
    public String getComment() { return comment; } public void setComment(String comment) { this.comment = comment; }
    public LocalDate getDate() { return date; } public void setDate(LocalDate date) { this.date = date; }
    public Order getOrder() { return order; } public void setOrder(Order order) { this.order = order; }
}
