package com.example.backend.config;

import com.example.backend.entity.Supervisor;
import com.example.backend.entity.User;
import com.example.backend.repository.SupervisorRepository;
import com.example.backend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final SupervisorRepository supervisorRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           SupervisorRepository supervisorRepository,
                           BCryptPasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.supervisorRepository = supervisorRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        // Ako u bazi nema nijednog registrovanog supervisora, kreiraj inicijalnog šefa
        if (supervisorRepository.count() == 0) {

            // Prvo proveri da ne postoji korisnik sa tim username-om
            if (!userRepository.existsByUsername("admin_supervisor")) {
                User user = new User();
                user.setUsername("admin_supervisor");
                user.setFirstName("Glavni");
                user.setLastName("Supervisor");
                user.setEmail("supervisor@poolpro.com");
                user.setPhone("065123456");
                user.setStatus(User.UserStatus.active);
                user.setPasswordHash(passwordEncoder.encode("SupervisorSifra123!")); // Promeni šifru po želji

                User savedUser = userRepository.save(user);

                Supervisor supervisor = new Supervisor();
                supervisor.setUser(savedUser);
                supervisorRepository.save(supervisor);

                System.out.println(">>> INICIJALNI SUPERVISOR JE USPEŠNO KREIRAN U BAZI <<<");
                System.out.println("Username: admin_supervisor");
                System.out.println("Password: SupervisorSifra123!");
            }
        }
    }
}