package com.example.backend.repository;

import com.example.backend.entity.Supervisor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SupervisorRepository extends JpaRepository<Supervisor, Integer> {
    boolean existsByUser_IdUser(Integer idUser);

    Optional<Supervisor> findByUser_IdUser(Integer idUser);
}
