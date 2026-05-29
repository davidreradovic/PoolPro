package com.example.backend.controller;

import com.example.backend.entity.User;
import com.example.backend.repository.ClientRepository;
import com.example.backend.repository.EmployeeRepository;
import com.example.backend.repository.SupervisorRepository;
import com.example.backend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:4200")
public class UserController {

    private final UserRepository userRepository;
    private final ClientRepository clientRepository;
    private final EmployeeRepository employeeRepository;
    private final SupervisorRepository supervisorRepository;

    public UserController(
            UserRepository userRepository,
            ClientRepository clientRepository,
            EmployeeRepository employeeRepository,
            SupervisorRepository supervisorRepository
    ) {
        this.userRepository = userRepository;
        this.clientRepository = clientRepository;
        this.employeeRepository = employeeRepository;
        this.supervisorRepository = supervisorRepository;
    }

    @GetMapping
    @PreAuthorize("hasRole('SUPERVISOR')")
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @GetMapping("/clients")
    @PreAuthorize("hasRole('SUPERVISOR')")
    public List<Map<String, Object>> getClients() {
        return clientRepository.findAll()
                .stream()
                .filter(client -> client.getUser().getStatus() == User.UserStatus.active)
                .map(client -> {
                    User user = client.getUser();
                    Map<String, Object> data = new HashMap<>();
                    data.put("idClient", client.getIdClient());
                    data.put("firstName", user.getFirstName());
                    data.put("lastName", user.getLastName());
                    data.put("username", user.getUsername());
                    data.put("email", user.getEmail());
                    return data;
                })
                .collect(Collectors.toList());
    }

    @PutMapping("/{id}/activate")
    @PreAuthorize("hasRole('SUPERVISOR')")
    public ResponseEntity<String> activateUser(@PathVariable Integer id) {
        return updateUserStatus(id, User.UserStatus.active);
    }

    @PutMapping("/{id}/deactivate")
    @PreAuthorize("hasRole('SUPERVISOR')")
    public ResponseEntity<String> deactivateUser(@PathVariable Integer id, Principal principal) {
        User currentUser = userRepository.findByUsername(principal.getName()).orElse(null);
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Current user not found");
        }

        if (currentUser.getIdUser().equals(id)) {
            return ResponseEntity.badRequest().body("Supervisor cannot deactivate their own account");
        }

        return updateUserStatus(id, User.UserStatus.inactive);
    }

    @GetMapping("/message-recipients")
    @PreAuthorize("isAuthenticated()")
    public List<Map<String, Object>> getMessageRecipients(Principal principal) {
        String currentUsername = principal.getName();
        User currentUser = userRepository.findByUsername(currentUsername).orElse(null);

        if (currentUser == null) {
            return List.of();
        }

        return userRepository.findAll()
                .stream()
                .filter(u -> !u.getIdUser().equals(currentUser.getIdUser()))
                .filter(u -> u.getStatus() == User.UserStatus.active)
                .filter(u -> canSendMessage(currentUser, u))
                .map(u -> createRecipientMap(u, getRole(u)))
                .collect(Collectors.toList());
    }

    @GetMapping("/message-recipients/search")
    @PreAuthorize("isAuthenticated()")
    public List<Map<String, Object>> searchMessageRecipients(
            @RequestParam String username,
            Principal principal
    ) {
        String query = username == null ? "" : username.trim();
        if (query.length() < 2) {
            return List.of();
        }

        User currentUser = userRepository.findByUsername(principal.getName()).orElse(null);
        if (currentUser == null) {
            return List.of();
        }

        return userRepository.findTop10ByUsernameContainingIgnoreCaseAndStatus(query, User.UserStatus.active)
                .stream()
                .filter(u -> !u.getIdUser().equals(currentUser.getIdUser()))
                .filter(u -> canSendMessage(currentUser, u))
                .map(u -> createRecipientMap(u, getRole(u)))
                .collect(Collectors.toList());
    }

    private ResponseEntity<String> updateUserStatus(Integer id, User.UserStatus status) {
        String action = status == User.UserStatus.active ? "activated" : "deactivated";
        return userRepository.findById(id)
                .map(user -> {
                    if (user.getStatus() == status) {
                        return ResponseEntity.ok("User account is already " + status.name());
                    }
                    user.setStatus(status);
                    userRepository.save(user);
                    return ResponseEntity.ok("User account " + action + " successfully");
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found"));
    }

    private Map<String, Object> createRecipientMap(User user, String role) {
        Map<String, Object> data = new HashMap<>();
        data.put("idUser", user.getIdUser());
        data.put("username", user.getUsername());
        data.put("firstName", user.getFirstName());
        data.put("lastName", user.getLastName());
        data.put("email", user.getEmail());
        data.put("role", role);
        return data;
    }

    private boolean canSendMessage(User sender, User receiver) {
        if (supervisorRepository.existsByUser_IdUser(sender.getIdUser())) {
            return true;
        }

        boolean senderIsEmployee = employeeRepository.existsByUser_IdUser(sender.getIdUser());
        boolean senderIsClient = clientRepository.existsByUser_IdUser(sender.getIdUser());
        return (senderIsEmployee || senderIsClient)
                && supervisorRepository.existsByUser_IdUser(receiver.getIdUser());
    }

    private String getRole(User user) {
        if (supervisorRepository.existsByUser_IdUser(user.getIdUser())) {
            return "SUPERVISOR";
        }
        if (employeeRepository.existsByUser_IdUser(user.getIdUser())) {
            return "EMPLOYEE";
        }
        return "CLIENT";
    }
}
