package com.example.backend.repository;

import com.example.backend.entity.ProjectComment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProjectCommentRepository extends JpaRepository<ProjectComment, Integer> {
    List<ProjectComment> findByProject_IdProject(Integer projectId);
}