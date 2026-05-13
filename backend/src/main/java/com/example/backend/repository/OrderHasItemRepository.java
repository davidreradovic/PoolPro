package com.example.backend.repository;

import com.example.backend.entity.OrderHasItem;
import com.example.backend.entity.OrderHasItemId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderHasItemRepository extends JpaRepository<OrderHasItem, OrderHasItemId> {
    List<OrderHasItem> findByOrder_IdOrder(Integer idOrder);
}