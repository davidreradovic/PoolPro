package com.example.backend.controller;

import com.example.backend.dto.LoginRequest;
import com.example.backend.dto.RegisterRequest;
import com.example.backend.entity.Client;
import com.example.backend.entity.Employee;
import com.example.backend.entity.Supervisor;
import com.example.backend.entity.User;
import com.example.backend.repository.ClientRepository;
import com.example.backend.repository.EmployeeRepository;
import com.example.backend.repository.SupervisorRepository;
import com.example.backend.repository.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:4200")
public class AuthController {

    private final UserRepository userRepository;
    private final ClientRepository clientRepository;
    private final EmployeeRepository employeeRepository;
    private final SupervisorRepository supervisorRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public AuthController(
            UserRepository userRepository,
            ClientRepository clientRepository,
            EmployeeRepository employeeRepository,
            SupervisorRepository supervisorRepository,
            BCryptPasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.clientRepository = clientRepository;
        this.employeeRepository = employeeRepository;
        this.supervisorRepository = supervisorRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/register")
    public String register(@RequestBody RegisterRequest request) {

        if (userRepository.existsByUsername(request.getUsername())) {
            return "Username already exists";
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            return "Email already exists";
        }

        String role = request.getRole() == null ? "" : request.getRole().toUpperCase();
        if (!role.equals("CLIENT") && !role.equals("EMPLOYEE") && !role.equals("SUPERVISOR")) {
            return "Invalid role";
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            user.setStatus(User.UserStatus.valueOf(request.getStatus().toLowerCase()));
        }

        String hashedPassword = passwordEncoder.encode(request.getPassword());
        user.setPasswordHash(hashedPassword);

        User savedUser = userRepository.save(user);

        if (role.equals("CLIENT")) {
            Client client = new Client();
            client.setUser(savedUser);
            clientRepository.save(client);
        } else if (role.equals("EMPLOYEE")) {
            Employee employee = new Employee();
            employee.setUser(savedUser);
            employee.setDescription(request.getDescription() == null || request.getDescription().isBlank()
                    ? "Employee"
                    : request.getDescription());
            employeeRepository.save(employee);
        } else if (role.equals("SUPERVISOR")) {
            Supervisor supervisor = new Supervisor();
            supervisor.setUser(savedUser);
            supervisorRepository.save(supervisor);
        }

        return "Registration successful";
    }

    @PostMapping("/login")
    public String login(@RequestBody LoginRequest request) {

        User user = userRepository.findByUsername(request.getUsername())
                .orElse(null);

        if (user == null || user.getStatus() == User.UserStatus.inactive) {
            return "Invalid username or password";
        }

        boolean passwordMatches = passwordEncoder.matches(
                request.getPassword(),
                user.getPasswordHash()
        );

        if (!passwordMatches) {
            return "Invalid username or password";
        }

        return "Login successful";
    }
}