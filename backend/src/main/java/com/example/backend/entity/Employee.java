package com.example.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "employee")
public class Employee {
    @Id
    @Column(name = "id_employee")
    private Integer idEmployee;

    @OneToOne
    @MapsId
    @JoinColumn(name = "id_employee")
    private User user;

    public Integer getIdEmployee() { return idEmployee; }
    public void setIdEmployee(Integer idEmployee) { this.idEmployee = idEmployee; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
}