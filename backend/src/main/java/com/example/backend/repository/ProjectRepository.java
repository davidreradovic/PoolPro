package com.example.backend.repository;

import com.example.backend.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProjectRepository extends JpaRepository<Project, Integer> {

    List<Project> findByClient_IdClient(Integer idClient);

    List<Project> findBySupervisor_IdSupervisor(Integer idSupervisor);

    List<Project> findByPublicProjectTrue();

}