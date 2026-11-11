package com.example.backend.controller;

import com.example.backend.dto.AuthResponse;
import com.example.backend.dto.LoginRequest;
import com.example.backend.dto.RegisterRequest;
import com.example.backend.dto.ChangePasswordRequest; // Moraćeš napraviti ovaj DTO, primer je ispod
import com.example.backend.entity.Client;
import com.example.backend.entity.Employee;
import com.example.backend.entity.Supervisor;
import com.example.backend.entity.User;
import com.example.backend.repository.ClientRepository;
import com.example.backend.repository.EmployeeRepository;
import com.example.backend.repository.SupervisorRepository;
import com.example.backend.repository.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import com.example.backend.security.JwtService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import java.security.Principal;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:4200")
public class AuthController {

    private final UserRepository userRepository;
    private final ClientRepository clientRepository;
    private final EmployeeRepository employeeRepository;
    private final SupervisorRepository supervisorRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthController(
            UserRepository userRepository,
            ClientRepository clientRepository,
            EmployeeRepository employeeRepository,
            SupervisorRepository supervisorRepository,
            BCryptPasswordEncoder passwordEncoder,
            JwtService jwtService
    ) {
        this.userRepository = userRepository;
        this.clientRepository = clientRepository;
        this.employeeRepository = employeeRepository;
        this.supervisorRepository = supervisorRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    // 1. JAVNA REGISTRACIJA: Klijent registruje sam sebe
    @PostMapping("/register")
    public ResponseEntity<String> registerClient(@RequestBody RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            return ResponseEntity.badRequest().body("Username already exists");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest().body("Email already exists");
        }

        User user = createBaseUser(request);
        User savedUser = userRepository.save(user);

        Client client = new Client();
        client.setUser(savedUser);
        clientRepository.save(client);

        return ResponseEntity.ok("Client registration successful");
    }

    // 2. ZAŠTIĆENA REGISTRACIJA: Supervisor kreira radnika (Employee)
@PostMapping("/register-employee")
@PreAuthorize("hasRole('SUPERVISOR')")
@Transactional
public ResponseEntity<String> registerEmployee(@RequestBody RegisterRequest request) {
    if (userRepository.existsByUsername(request.getUsername())) {
        return ResponseEntity.badRequest().body("Username already exists");
    }
    if (userRepository.existsByEmail(request.getEmail())) {
        return ResponseEntity.badRequest().body("Email already exists");
    }

    // 2. Kreiramo i čuvamo bazičnog korisnika
    User user = createBaseUser(request);
    User savedUser = userRepository.save(user);

    // 3. Kreiramo novog zaposlenog
    Employee employee = new Employee();
    
    // VEOMA BITNO: Povezujemo objekat. Hibernate će sam izvući ID iz savedUser-a!
    employee.setUser(savedUser); 
    
    // UKLONJENO: employee.setIdEmployee(savedUser.getIdUser()); -> Ovo brišemo!

    employee.setDescription(request.getDescription() == null || request.getDescription().isBlank()
            ? "Employee"
            : request.getDescription());
            
    // 4. Čuvamo zaposlenog
    employeeRepository.save(employee);

    return ResponseEntity.ok("Employee registered successfully by Supervisor");
}

    // 3. NOVO: ZAŠTIĆENA REGISTRACIJA: Supervisor kreira novog Supervisora
    @PostMapping("/register-supervisor")
    @PreAuthorize("hasRole('SUPERVISOR')")
    @Transactional
    public ResponseEntity<String> registerSupervisor(@RequestBody RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            return ResponseEntity.badRequest().body("Username already exists");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest().body("Email already exists");
        }

        User user = createBaseUser(request);
        User savedUser = userRepository.save(user);

        Supervisor supervisor = new Supervisor();
        supervisor.setUser(savedUser);
        supervisorRepository.saveAndFlush(supervisor);

        return ResponseEntity.ok("New Supervisor registered successfully");
    }

    // 4. NOVO: PROMJENA LOZINKE (Dostupno svima koji su ulogovani)
    @PostMapping("/change-password")
    public ResponseEntity<String> changePassword(@RequestBody ChangePasswordRequest request, Principal principal) {
        // Principal nam daje username trenutno ulogovanog korisnika preko JWT tokena
        String currentUsername = principal.getName();

        User user = userRepository.findByUsername(currentUsername)
                .orElse(null);

        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }

        // 1. Provjera da li je stara lozinka tačna
        if (!passwordEncoder.matches(request.getOldPassword(), user.getPasswordHash())) {
            return ResponseEntity.badRequest().body("Incorrect old password");
        }

        // 2. Kriptovanje i čuvanje nove lozinke
        String hashedNewPassword = passwordEncoder.encode(request.getNewPassword());
        user.setPasswordHash(hashedNewPassword);
        userRepository.save(user);

        return ResponseEntity.ok("Password changed successfully");
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername()).orElse(null);

        if (user == null || user.getStatus() == User.UserStatus.inactive) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid username or password");
        }

        boolean passwordMatches = passwordEncoder.matches(request.getPassword(), user.getPasswordHash());

        if (!passwordMatches) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid username or password");
        }

        String role;

        if (supervisorRepository.existsByUser_IdUser(user.getIdUser())) {
            role = "SUPERVISOR";
        } else if (employeeRepository.existsByUser_IdUser(user.getIdUser())) {
            role = "EMPLOYEE";
        } else {
            role = "CLIENT";
        }

        String token = jwtService.generateToken(user.getUsername(), role);

        return ResponseEntity.ok(new AuthResponse(
                user.getIdUser(),
                user.getUsername(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                role,
                token,
                "Login successful"
        ));
    }

    private User createBaseUser(RegisterRequest request) {
        User user = new User();
        user.setUsername(request.getUsername());
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());

        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            user.setStatus(User.UserStatus.valueOf(request.getStatus().toLowerCase()));
        } else {
            user.setStatus(User.UserStatus.active);
        }

        String hashedPassword = passwordEncoder.encode(request.getPassword());
        user.setPasswordHash(hashedPassword);
        return user;
    }
}
