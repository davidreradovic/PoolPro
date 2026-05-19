package com.example.backend.repository;

import com.example.backend.entity.CartHasItem;
import com.example.backend.entity.CartHasItemId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CartHasItemRepository extends JpaRepository<CartHasItem, CartHasItemId> {
    List<CartHasItem> findByCart_IdCart(Integer idCart);
    void deleteByCart_IdCartAndItem_IdItem(Integer idCart, Integer idItem);
}