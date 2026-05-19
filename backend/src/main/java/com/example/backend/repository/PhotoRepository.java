package com.example.backend.repository;

import com.example.backend.entity.Photo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PhotoRepository extends JpaRepository<Photo, Integer> {

    List<Photo> findByTask_IdTask(Integer taskId);
}