package com.example.backend.repository;

import com.example.backend.entity.OrderComplaint;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderComplaintRepository extends JpaRepository<OrderComplaint, Integer> {
    List<OrderComplaint> findByOrder_IdOrder(Integer idOrder);
}