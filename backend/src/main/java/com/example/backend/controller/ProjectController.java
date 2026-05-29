package com.example.backend.controller;

import com.example.backend.dto.CreateComplaintRequest;
import com.example.backend.dto.CreateProjectRequest;
import com.example.backend.entity.Client;
import com.example.backend.entity.Message;
import com.example.backend.entity.Project;
import com.example.backend.entity.ProjectComplaint;
import com.example.backend.entity.Supervisor;
import com.example.backend.entity.User;
import com.example.backend.repository.ClientRepository;
import com.example.backend.repository.EmployeeRepository;
import com.example.backend.repository.MessageRepository;
import com.example.backend.repository.ProjectComplaintRepository;
import com.example.backend.repository.ProjectRepository;
import com.example.backend.repository.PhotoRepository;
import com.example.backend.repository.SupervisorRepository;
import com.example.backend.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import com.example.backend.repository.TaskRepository;
import com.example.backend.entity.Task;
import java.security.Principal;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
@RestController
@RequestMapping("/api/projects")
@CrossOrigin(origins = "*")
public class ProjectController {

    private final ProjectRepository projectRepository;
    private final ClientRepository clientRepository;
    private final SupervisorRepository supervisorRepository;
    private final UserRepository userRepository;
    private final TaskRepository taskRepository;
    private final PhotoRepository photoRepository;
    private final EmployeeRepository employeeRepository;
    private final ProjectComplaintRepository projectComplaintRepository;
    private final MessageRepository messageRepository;
    public ProjectController(
            ProjectRepository projectRepository,
            ClientRepository clientRepository,
            SupervisorRepository supervisorRepository,
            UserRepository userRepository,
            TaskRepository taskRepository,
            PhotoRepository photoRepository,
            EmployeeRepository employeeRepository,
            ProjectComplaintRepository projectComplaintRepository,
            MessageRepository messageRepository
    ) {
        this.projectRepository = projectRepository;
        this.clientRepository = clientRepository;
        this.supervisorRepository = supervisorRepository;
        this.userRepository = userRepository;
        this.taskRepository = taskRepository;
        this.photoRepository = photoRepository;
        this.employeeRepository = employeeRepository;
        this.projectComplaintRepository = projectComplaintRepository;
        this.messageRepository = messageRepository;
    }

    @PostMapping
    @PreAuthorize("hasRole('SUPERVISOR')")
    public Object createProject(@RequestBody CreateProjectRequest request, Principal principal) {

        Client client = clientRepository.findById(request.getIdClient())
                .orElse(null);

        if (client == null) {
            return "Client not found";
        }

        User currentUser = userRepository.findByUsername(principal.getName()).orElse(null);
        if (currentUser == null) {
            return "Supervisor user not found";
        }

        Supervisor supervisor = supervisorRepository.findByUser_IdUser(currentUser.getIdUser())
                .orElse(null);

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

    @GetMapping("/public-showcase")
    public Object getPublicProjectShowcase() {
        return projectRepository.findByPublicProjectTrue()
                .stream()
                .sorted(Comparator
                        .comparing((Project project) -> project.getStatus() == Project.ProjectStatus.done).reversed()
                        .thenComparing(Project::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .map(this::toPublicProjectResponse)
                .toList();
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

    @PutMapping("/{id}/public")
    @PreAuthorize("hasRole('SUPERVISOR')")
    public Object updateProjectVisibility(
            @PathVariable Integer id,
            @RequestParam boolean publicProject
    ) {

        Project project = projectRepository.findById(id)
                .orElse(null);

        if (project == null) {
            return "Project not found";
        }

        project.setPublicProject(publicProject);
        return projectRepository.save(project);
    }

    @GetMapping("/{id}/tasks")
    public Object getProjectTasks(@PathVariable Integer id, Authentication authentication) {

        Project project = projectRepository.findById(id).orElse(null);

        if (project == null) {
            return "Project not found";
        }

        User currentUser = authentication == null
                ? null
                : userRepository.findByUsername(authentication.getName()).orElse(null);

        if (currentUser == null || !canViewProjectTasks(currentUser, project)) {
            return "Project tasks are not available for this user";
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
                        "publicProject", project.getPublicProject(),
                        "createdAt", project.getCreatedAt()
                ))
                .toList();
    }

    @PostMapping("/{id}/complaints")
    @PreAuthorize("hasRole('CLIENT')")
    public Object createProjectComplaint(
            @PathVariable Integer id,
            @Valid @RequestBody CreateComplaintRequest request,
            Authentication authentication
    ) {
        Project project = projectRepository.findById(id).orElse(null);

        if (project == null) {
            return "Project not found";
        }

        User currentUser = authentication == null
                ? null
                : userRepository.findByUsername(authentication.getName()).orElse(null);

        if (currentUser == null || !isProjectClient(currentUser, project)) {
            return "You are not allowed to complain about this project";
        }

        ProjectComplaint complaint = new ProjectComplaint();
        complaint.setProject(project);
        complaint.setComment(request.getComment());

        ProjectComplaint saved = projectComplaintRepository.save(complaint);
        sendProjectComplaintMessageToSupervisors(project, saved);

        Map<String, Object> response = new HashMap<>();
        response.put("idProjectComplaint", saved.getIdProjectComplaint());
        response.put("projectId", project.getIdProject());
        response.put("projectTitle", project.getTitle());
        response.put("comment", saved.getComment());
        response.put("timestamp", saved.getTimestamp());

        return response;
    }

    @GetMapping("/{id}/complaints")
    @PreAuthorize("hasAnyRole('CLIENT', 'SUPERVISOR')")
    public Object getProjectComplaints(@PathVariable Integer id, Authentication authentication) {
        Project project = projectRepository.findById(id).orElse(null);

        if (project == null) {
            return "Project not found";
        }

        User currentUser = authentication == null
                ? null
                : userRepository.findByUsername(authentication.getName()).orElse(null);

        if (currentUser == null
                || (!isProjectClient(currentUser, project)
                && !supervisorRepository.existsByUser_IdUser(currentUser.getIdUser()))) {
            return "Project complaints are not available for this user";
        }

        return projectComplaintRepository.findByProject_IdProject(id)
                .stream()
                .map(c -> {
                    Map<String, Object> data = new HashMap<>();
                    data.put("idProjectComplaint", c.getIdProjectComplaint());
                    data.put("projectId", c.getProject().getIdProject());
                    data.put("projectTitle", c.getProject().getTitle());
                    data.put("comment", c.getComment());
                    data.put("timestamp", c.getTimestamp());

                    User clientUser = c.getProject().getClient().getUser();
                    if (clientUser != null) {
                        data.put("clientUserId", clientUser.getIdUser());
                        data.put("clientUsername", clientUser.getUsername());
                        data.put("clientName", clientUser.getFirstName() + " " + clientUser.getLastName());
                    }

                    return data;
                })
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

    private Map<String, Object> toPublicProjectResponse(Project project) {
        Map<String, Object> response = new HashMap<>();
        response.put("idProject", project.getIdProject());
        response.put("title", project.getTitle());
        response.put("description", project.getDescription());
        response.put("status", project.getStatus());
        response.put("createdAt", project.getCreatedAt());
        response.put("clientReview", project.getClientReview());
        response.put("reviewText", project.getReviewText());

        List<Map<String, Object>> taskPhotos = photoRepository.findByTask_Project_IdProject(project.getIdProject())
                .stream()
                .map(photo -> {
                    Map<String, Object> photoData = new HashMap<>();
                    photoData.put("idPhoto", photo.getIdPhoto());
                    photoData.put("taskId", photo.getTask().getIdTask());
                    photoData.put("taskTitle", photo.getTask().getTitle());
                    photoData.put("img", photo.getImg());
                    photoData.put("imgUrl", publicImageUrl(photo.getImg()));
                    return photoData;
                })
                .toList();

        response.put("photos", taskPhotos);
        return response;
    }

    private String publicImageUrl(String imagePath) {
        if (imagePath == null || imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
            return imagePath;
        }

        String fileName = imagePath.startsWith("poolpro_uploads/")
                ? imagePath.substring("poolpro_uploads/".length())
                : imagePath;

        return ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/poolpro_uploads/")
                .path(fileName)
                .toUriString();
    }

    private boolean canViewProjectTasks(User user, Project project) {
        if (supervisorRepository.existsByUser_IdUser(user.getIdUser())) {
            return true;
        }

        if (employeeRepository.existsByUser_IdUser(user.getIdUser())) {
            return true;
        }

        return project.getClient() != null
                && project.getClient().getUser() != null
                && project.getClient().getUser().getIdUser().equals(user.getIdUser());
    }

    private boolean isProjectClient(User user, Project project) {
        return project.getClient() != null
                && project.getClient().getUser() != null
                && project.getClient().getUser().getIdUser().equals(user.getIdUser());
    }

    private void sendProjectComplaintMessageToSupervisors(Project project, ProjectComplaint complaint) {
        User clientUser = project.getClient() == null ? null : project.getClient().getUser();
        if (clientUser == null) {
            return;
        }

        String projectTitle = project.getTitle() == null ? "" : project.getTitle().replace("\"", "'");
        String content = "[[PROJECT_COMPLAINT id_project_complaint=\""
                + complaint.getIdProjectComplaint()
                + "\" project_id=\""
                + project.getIdProject()
                + "\" project_title=\""
                + projectTitle
                + "\"]]\n"
                + complaint.getComment();

        supervisorRepository.findAll().forEach(supervisor -> {
            if (supervisor.getUser() == null) {
                return;
            }

            Message message = new Message();
            message.setSender(clientUser);
            message.setReceiver(supervisor.getUser());
            message.setContent(content);
            message.setIsRead(false);
            messageRepository.save(message);
        });
    }
}
