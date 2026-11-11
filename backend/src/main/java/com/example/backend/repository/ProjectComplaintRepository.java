package com.example.backend.repository;

import com.example.backend.entity.ProjectComplaint;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProjectComplaintRepository extends JpaRepository<ProjectComplaint, Integer> {
    List<ProjectComplaint> findByProject_IdProject(Integer projectId);
}
