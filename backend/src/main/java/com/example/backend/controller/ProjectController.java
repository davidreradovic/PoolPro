package com.example.backend.controller;

import com.example.backend.dto.CreateProjectRequest;
import com.example.backend.entity.Client;
import com.example.backend.entity.Project;
import com.example.backend.entity.Supervisor;
import com.example.backend.repository.ClientRepository;
import com.example.backend.repository.ProjectRepository;
import com.example.backend.repository.SupervisorRepository;
import org.springframework.web.bind.annotation.*;
import com.example.backend.repository.TaskRepository;
import com.example.backend.entity.Task;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
@RestController
@RequestMapping("/api/projects")
@CrossOrigin(origins = "http://localhost:4200")
public class ProjectController {

    private final ProjectRepository projectRepository;
    private final ClientRepository clientRepository;
    private final SupervisorRepository supervisorRepository;
    private final TaskRepository taskRepository;
    public ProjectController(
            ProjectRepository projectRepository,
            ClientRepository clientRepository,
            SupervisorRepository supervisorRepository,
            TaskRepository taskRepository
    ) {
        this.projectRepository = projectRepository;
        this.clientRepository = clientRepository;
        this.supervisorRepository = supervisorRepository;
        this.taskRepository = taskRepository;
    }

    @PostMapping
    @PreAuthorize("hasRole('SUPERVISOR')")
    public Object createProject(@RequestBody CreateProjectRequest request) {

        Client client = clientRepository.findById(request.getIdClient())
                .orElse(null);

        Supervisor supervisor = supervisorRepository.findById(request.getIdSupervisor())
                .orElse(null);

        if (client == null) {
            return "Client not found";
        }

        if (supervisor == null) {
            return "Supervisor not found";
        }

        Project project = new Project();

        project.setClient(client);
        project.setSupervisor(supervisor);
        project.setTitle(request.getTitle());
        project.setDescription(request.getDescription());

        if (request.getPublicProject() != null) {
            project.setPublicProject(request.getPublicProject());
        }

        return projectRepository.save(project);
    }

    @GetMapping
    public List<Project> getAllProjects() {
        return projectRepository.findAll();
    }

    @GetMapping("/{id}")
    public Object getProjectById(@PathVariable Integer id) {

        Project project = projectRepository.findById(id)
                .orElse(null);

        if (project == null) {
            return "Project not found";
        }

        return project;
    }

    @PutMapping("/{id}/status")
    public Object updateProjectStatus(
            @PathVariable Integer id,
            @RequestParam String status
    ) {

        Project project = projectRepository.findById(id)
                .orElse(null);

        if (project == null) {
            return "Project not found";
        }

        try {
            project.setStatus(Project.ProjectStatus.valueOf(status));
        } catch (Exception e) {
            return "Invalid status";
        }

        return projectRepository.save(project);
    }
    @GetMapping("/{id}/tasks")
    public Object getProjectTasks(@PathVariable Integer id) {

        Project project = projectRepository.findById(id).orElse(null);

        if (project == null) {
            return "Project not found";
        }

        return taskRepository.findByProject_IdProject(id)
                .stream()
                .map(task -> {
                    return java.util.Map.of(
                            "idTask", task.getIdTask(),
                            "title", task.getTitle(),
                            "description", task.getDescription(),
                            "status", task.getStatus(),
                            "deadline", task.getDeadline(),
                            "employee", task.getEmployee() == null ? "Not assigned" :
                                    task.getEmployee().getUser().getFirstName() + " " +
                                            task.getEmployee().getUser().getLastName()
                    );
                })
                .toList();
    }
    @GetMapping("/client/{clientId}")
    public Object getProjectsByClient(@PathVariable Integer clientId) {

        Client client = clientRepository.findById(clientId).orElse(null);

        if (client == null) {
            return "Client not found";
        }

        return projectRepository.findByClient_IdClient(clientId)
                .stream()
                .map(project -> java.util.Map.of(
                        "idProject", project.getIdProject(),
                        "title", project.getTitle(),
                        "description", project.getDescription(),
                        "status", project.getStatus(),
                        "createdAt", project.getCreatedAt()
                ))
                .toList();
    }
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SUPERVISOR')")
    public String deleteProject(@PathVariable Integer id) {

        if (!projectRepository.existsById(id)) {
            return "Project not found";
        }

        projectRepository.deleteById(id);

        return "Project deleted";
    }
}