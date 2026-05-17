package com.example.backend.repository;

import com.example.backend.entity.ItemComment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ItemCommentRepository extends JpaRepository<ItemComment, Integer> {
    List<ItemComment> findByItem_IdItem(Integer itemId);
}