package com.example.backend.controller;

import com.example.backend.entity.Employee;
import com.example.backend.entity.User;
import com.example.backend.repository.EmployeeRepository;
import com.example.backend.repository.UserRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/employees")
@CrossOrigin(origins = "http://localhost:4200")
public class EmployeeController {

    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;

    public EmployeeController(
            EmployeeRepository employeeRepository,
            UserRepository userRepository
    ) {
        this.employeeRepository = employeeRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    public List<Employee> getAllEmployees() {
        return employeeRepository.findAll();
    }

    @GetMapping("/{id}")
    public Object getEmployeeById(@PathVariable Integer id) {
        Employee employee = employeeRepository.findById(id).orElse(null);

        if (employee == null) {
            return "Employee not found";
        }

        return employee;
    }

    @GetMapping("/user/{userId}")
    public Object getEmployeeByUserId(@PathVariable Integer userId) {
        Employee employee = employeeRepository.findByUser_IdUser(userId).orElse(null);

        if (employee == null) {
            return "Employee not found";
        }

        return employee;
    }

    @PutMapping("/{id}/description")
    public Object updateDescription(
            @PathVariable Integer id,
            @RequestParam String description
    ) {
        Employee employee = employeeRepository.findById(id).orElse(null);

        if (employee == null) {
            return "Employee not found";
        }

        employee.setDescription(description);
        return employeeRepository.save(employee);
    }

    @PutMapping("/{id}/status")
    public Object updateEmployeeUserStatus(
            @PathVariable Integer id,
            @RequestParam String status
    ) {
        Employee employee = employeeRepository.findById(id).orElse(null);

        if (employee == null) {
            return "Employee not found";
        }

        User user = employee.getUser();

        try {
            user.setStatus(User.UserStatus.valueOf(status));
        } catch (Exception e) {
            return "Invalid status";
        }

        userRepository.save(user);
        return employeeRepository.save(employee);
    }
}