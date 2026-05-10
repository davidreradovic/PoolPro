package com.example.backend.controller;

import com.example.backend.dto.CreateTaskRequest;
import com.example.backend.entity.Employee;
import com.example.backend.entity.Project;
import com.example.backend.entity.Task;
import com.example.backend.repository.EmployeeRepository;
import com.example.backend.repository.ProjectRepository;
import com.example.backend.repository.TaskRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "http://localhost:4200")
public class TaskController {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final EmployeeRepository employeeRepository;

    public TaskController(
            TaskRepository taskRepository,
            ProjectRepository projectRepository,
            EmployeeRepository employeeRepository
    ) {
        this.taskRepository = taskRepository;
        this.projectRepository = projectRepository;
        this.employeeRepository = employeeRepository;
    }

    @PostMapping
    public Object createTask(@RequestBody CreateTaskRequest request) {

        Project project = projectRepository.findById(request.getIdProject())
                .orElse(null);

        if (project == null) {
            return "Project not found";
        }

        Employee employee = null;

        if (request.getIdEmployee() != null) {
            employee = employeeRepository.findById(request.getIdEmployee())
                    .orElse(null);

            if (employee == null) {
                return "Employee not found";
            }
        }

        Task task = new Task();
        task.setProject(project);
        task.setEmployee(employee);
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setDeadline(request.getDeadline());

        return taskRepository.save(task);
    }

    @GetMapping
    public List<Task> getAllTasks() {
        return taskRepository.findAll();
    }

    @GetMapping("/project/{projectId}")
    public List<Task> getTasksByProject(@PathVariable Integer projectId) {
        return taskRepository.findByProject_IdProject(projectId);
    }

    @GetMapping("/employee/{employeeId}")
    public List<Task> getTasksByEmployee(@PathVariable Integer employeeId) {
        return taskRepository.findByEmployee_IdEmployee(employeeId);
    }

    @GetMapping("/{id}")
    public Object getTaskById(@PathVariable Integer id) {
        Task task = taskRepository.findById(id).orElse(null);

        if (task == null) {
            return "Task not found";
        }

        return task;
    }

    @PutMapping("/{id}/status")
    public Object updateTaskStatus(
            @PathVariable Integer id,
            @RequestParam String status
    ) {
        Task task = taskRepository.findById(id).orElse(null);

        if (task == null) {
            return "Task not found";
        }

        try {
            task.setStatus(Task.TaskStatus.valueOf(status));
        } catch (Exception e) {
            return "Invalid status";
        }

        return taskRepository.save(task);
    }
    @PutMapping("/{taskId}/assign/{employeeId}")
    public Object assignTaskToEmployee(
            @PathVariable Integer taskId,
            @PathVariable Integer employeeId
    ) {
        Task task = taskRepository.findById(taskId).orElse(null);

        if (task == null) {
            return "Task not found";
        }

        Employee employee = employeeRepository.findById(employeeId).orElse(null);

        if (employee == null) {
            return "Employee not found";
        }

        task.setEmployee(employee);

        if (task.getStatus() == Task.TaskStatus.todo) {
            task.setStatus(Task.TaskStatus.in_progress);
        }

        return taskRepository.save(task);
    }

    @PutMapping("/{taskId}/unassign")
    public Object unassignTaskFromEmployee(@PathVariable Integer taskId) {
        Task task = taskRepository.findById(taskId).orElse(null);

        if (task == null) {
            return "Task not found";
        }

        task.setEmployee(null);
        task.setStatus(Task.TaskStatus.todo);

        return taskRepository.save(task);
    }

    @DeleteMapping("/{id}")
    public String deleteTask(@PathVariable Integer id) {
        if (!taskRepository.existsById(id)) {
            return "Task not found";
        }

        taskRepository.deleteById(id);
        return "Task deleted";
    }
}