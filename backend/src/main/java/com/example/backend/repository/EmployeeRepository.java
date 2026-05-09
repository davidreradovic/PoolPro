package com.example.backend.repository;

import com.example.backend.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EmployeeRepository extends JpaRepository<Employee, Integer> {
    boolean existsByUser_IdUser(Integer idUser);
    Optional<Employee> findByUser_IdUser(Integer idUser);
}