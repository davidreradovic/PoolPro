package com.example.backend.repository;

import com.example.backend.entity.ItemReview;
import com.example.backend.entity.ItemReviewId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ItemReviewRepository
        extends JpaRepository<ItemReview, ItemReviewId> {

    List<ItemReview> findByItem_IdItem(Integer itemId);

    List<ItemReview> findByClient_IdClient(Integer clientId);
}