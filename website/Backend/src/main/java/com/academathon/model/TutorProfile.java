package com.academathon.model;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;

@Entity
@Table(name = "tutor_profiles")
public class TutorProfile {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "display_name", nullable = false)
    private String displayName;

    @Column(name = "hourly_rate", nullable = false)
    private BigDecimal hourlyRate = BigDecimal.ZERO;

    @Column(name = "university")
    private String university;

    @Column(name = "program")
    private String program;

    @Column(name = "academic_year")
    private String academicYear;

    @Column(name = "grade_levels", columnDefinition = "TEXT")
    private String gradeLevels; // JSON array stored as string

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now(ZoneId.of("America/New_York"));

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now(ZoneId.of("America/New_York"));

    @ManyToMany
    @JoinTable(
        name = "tutor_subjects",
        joinColumns = @JoinColumn(name = "tutor_profile_id"),
        inverseJoinColumns = @JoinColumn(name = "subject_id")
    )
    private List<Subject> subjects;

    public TutorProfile() {
        // JPA requires a public no-args constructor
    }

    public TutorProfile(User user, String displayName, BigDecimal hourlyRate, List<Subject> subjects) {
        this.user = user;
        this.displayName = displayName;
        this.hourlyRate = hourlyRate;
        this.subjects = subjects;
    }

    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getDisplayName() {
        // The display name is always meant to mirror the linked user's
        // username. Prefer the live value so updates propagate immediately
        // and the column never drifts out of sync.
        if (user != null && user.getDisplayUsername() != null
                && !user.getDisplayUsername().isBlank()) {
            return user.getDisplayUsername();
        }
        return displayName;
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    public BigDecimal getHourlyRate() {
        return hourlyRate;
    }

    public void setHourlyRate(BigDecimal hourlyRate) {
        this.hourlyRate = hourlyRate;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now(ZoneId.of("America/New_York"));
    }

    public List<Subject> getSubjects() {
        return subjects;
    }

    
    public void setSubjects(List<Subject> subjects) {
        this.subjects = subjects;
    }

    public String getUniversity() {
        return university;
    }

    public void setUniversity(String university) {
        this.university = university;
    }

    public String getProgram() {
        return program;
    }

    public void setProgram(String program) {
        this.program = program;
    }

    public String getAcademicYear() {
        return academicYear;
    }

    public void setAcademicYear(String academicYear) {
        this.academicYear = academicYear;
    }

    public String getGradeLevels() {
        return gradeLevels;
    }

    public void setGradeLevels(String gradeLevels) {
        this.gradeLevels = gradeLevels;
    }
}