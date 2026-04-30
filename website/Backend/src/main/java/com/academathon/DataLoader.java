package com.academathon;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.academathon.model.Subject;
import com.academathon.model.TutorProfile;
import com.academathon.model.User;

import com.academathon.repository.SubjectRepository;
import com.academathon.repository.TutorProfileRepository;
import com.academathon.repository.UserRepository;

@Component
public class DataLoader implements ApplicationRunner {

    private final UserRepository userRepo;
    private final TutorProfileRepository tutorRepo;
    private final SubjectRepository subjectRepo;
    private final PasswordEncoder encoder;

    public DataLoader(UserRepository userRepo,
                      TutorProfileRepository tutorRepo,
                      SubjectRepository subjectRepo,
                      PasswordEncoder encoder) {
        this.userRepo = userRepo;
        this.tutorRepo = tutorRepo;
        this.subjectRepo = subjectRepo;
        this.encoder = encoder;
    }

    @Override
    public void run(ApplicationArguments args) throws Exception {
        // Create or fetch subjects
        Subject math = subjectRepo.findByName("Math")
            .orElseGet(() -> subjectRepo.save(new Subject("Math")));
        Subject physics = subjectRepo.findByName("Physics")
            .orElseGet(() -> subjectRepo.save(new Subject("Physics")));
        Subject chemistry = subjectRepo.findByName("Chemistry")
            .orElseGet(() -> subjectRepo.save(new Subject("Chemistry")));

        // Create or fetch tutor user for Jane
        User janeUser = userRepo.findByEmail("jane@example.com")
            .orElseGet(() -> {
                User u = new User();
                u.setEmail("jane@example.com");
                u.setUsername("jane");
                u.setPasswordHash(encoder.encode("password"));
                u.setRole(User.Role.TUTOR);
                u.setEnabled(true); // Enable for testing
                return userRepo.save(u);
            });
        
        // Ensure user is enabled for testing
        if (!janeUser.isEnabled()) {
            janeUser.setEnabled(true);
            userRepo.save(janeUser);
        }

        // Jane Doe profile - only create if doesn't exist
        TutorProfile jane = tutorRepo.findByUser(janeUser)
            .orElseGet(() -> {
                janeUser.setBio("Experienced science tutor");
                userRepo.save(janeUser);
                TutorProfile newProfile = new TutorProfile();
                newProfile.setUser(janeUser);
                newProfile.setDisplayName("Jane Doe");
                newProfile.setHourlyRate(new BigDecimal("60.00"));
                newProfile.setSubjects(List.of(math, physics, chemistry));
                TutorProfile saved = tutorRepo.save(newProfile);
                System.out.println("Created new tutor: " + saved.getDisplayName());
                return saved;
            });
        System.out.println("Loaded tutor: " + jane.getDisplayName());

        // Create or fetch tutor user for John
        User johnUser = userRepo.findByEmail("john@example.com")
            .orElseGet(() -> {
                User u = new User();
                u.setEmail("john@example.com");
                u.setUsername("john");
                u.setPasswordHash(encoder.encode("password"));
                u.setRole(User.Role.TUTOR);
                u.setEnabled(true); // Enable for testing
                return userRepo.save(u);
            });
        
        // Ensure user is enabled for testing
        if (!johnUser.isEnabled()) {
            johnUser.setEnabled(true);
            userRepo.save(johnUser);
        }
        System.out.println("John's bcrypt hash is: " + johnUser.getPasswordHash() + " " + johnUser.getPassword());

        // John Doe profile - only create if doesn't exist
        TutorProfile john = tutorRepo.findByUser(johnUser)
            .orElseGet(() -> {
                johnUser.setBio("Experienced math tutor");
                userRepo.save(johnUser);
                TutorProfile newProfile = new TutorProfile();
                newProfile.setUser(johnUser);
                newProfile.setDisplayName("John Doe");
                newProfile.setHourlyRate(new BigDecimal("60.00"));
                newProfile.setSubjects(List.of(math));
                TutorProfile saved = tutorRepo.save(newProfile);
                System.out.println("Created new tutor: " + saved.getDisplayName());
                return saved;
            });
        System.out.println("Loaded tutor: " + john.getDisplayName());
        
        // Remove user with email 'ryant012015@gmail.com' if it exists
        // userRepo.findByEmail("netherofficial2018@gmail.com").ifPresent(user -> {
        //     System.out.println("Removing user with email: " + user.getEmail() + " (ID: " + user.getId() + ")");
        //     userRepo.delete(user);
        //     System.out.println("Successfully removed user: " + user.getEmail());
        // });
    }
}
