package com.example.backend.repository;

import com.example.backend.entity.ItemPhoto;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ItemPhotoRepository
        extends JpaRepository<ItemPhoto, Integer> {

    List<ItemPhoto> findByItem_IdItem(Integer itemId);

    void deleteByItem_IdItem(Integer itemId);
}
