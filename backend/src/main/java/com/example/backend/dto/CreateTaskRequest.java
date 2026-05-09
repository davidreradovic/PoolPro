package com.example.backend.dto;

import java.time.LocalDate;

public class CreateTaskRequest {

    private Integer idProject;
    private Integer idEmployee;
    private String title;
    private String description;
    private LocalDate deadline;

    public Integer getIdProject() { return idProject; }
    public void setIdProject(Integer idProject) { this.idProject = idProject; }

    public Integer getIdEmployee() { return idEmployee; }
    public void setIdEmployee(Integer idEmployee) { this.idEmployee = idEmployee; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDate getDeadline() { return deadline; }
    public void setDeadline(LocalDate deadline) { this.deadline = deadline; }
}