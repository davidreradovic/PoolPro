package com.example.backend.repository;

import com.example.backend.entity.OrderHasItem;
import com.example.backend.entity.OrderHasItemId;
import com.example.backend.entity.Item;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface OrderHasItemRepository extends JpaRepository<OrderHasItem, OrderHasItemId> {
    List<OrderHasItem> findByOrder_IdOrder(Integer idOrder);

    @Query("""
            select ohi.item
            from OrderHasItem ohi
            group by ohi.item
            order by sum(ohi.quantity) desc
            """)
    List<Item> findTopSellingItems();
}
