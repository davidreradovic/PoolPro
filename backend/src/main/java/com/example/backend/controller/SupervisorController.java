package com.example.backend.controller;

import com.example.backend.entity.Supervisor;
import com.example.backend.repository.SupervisorRepository;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/supervisors")
@CrossOrigin(origins = "*")
public class SupervisorController {

    private final SupervisorRepository supervisorRepository;

    public SupervisorController(SupervisorRepository supervisorRepository) {
        this.supervisorRepository = supervisorRepository;
    }

    @GetMapping
    @PreAuthorize("hasRole('SUPERVISOR')")
    public List<Supervisor> getAllSupervisors() {
        return supervisorRepository.findAll();
    }
}