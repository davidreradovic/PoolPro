package com.example.backend.controller;

import com.example.backend.entity.User;
import com.example.backend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:4200")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping
    @PreAuthorize("hasRole('SUPERVISOR')")
    public List<User> getAllUsers() {
        return userRepository.findAll();
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
}
