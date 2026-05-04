package com.example.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "task")
public class Task {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_task")
    private Integer idTask;

    @ManyToOne(optional = false)
    @JoinColumn(name = "id_project")
    private Project project;

    @ManyToOne
    @JoinColumn(name = "id_employee")
    private Employee employee;

    @Column(nullable = false, length = 100)
    private String title;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TaskStatus status = TaskStatus.todo;

    @Column
    private LocalDate deadline;

    public enum TaskStatus {
        todo,
        in_progress,
        done,
        cancelled
    }

    public Integer getIdTask() { return idTask; }
    public void setIdTask(Integer idTask) { this.idTask = idTask; }
    public Project getProject() { return project; }
    public void setProject(Project project) { this.project = project; }
    public Employee getEmployee() { return employee; }
    public void setEmployee(Employee employee) { this.employee = employee; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public TaskStatus getStatus() { return status; }
    public void setStatus(TaskStatus status) { this.status = status; }
    public LocalDate getDeadline() { return deadline; }
    public void setDeadline(LocalDate deadline) { this.deadline = deadline; }
}
