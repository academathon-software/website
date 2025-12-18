package com.academathon.model;
import jakarta.persistence.*;
import java.util.Set;

@Entity
@Table(name = "subjects")
public class Subject {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @ManyToMany(mappedBy = "subjects")
    private Set<TutorProfile> tutors;

    public Subject() {
        // JPA requires a public no-args constructor
    }

    public Subject(String name) {
        this.name = name;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Set<TutorProfile> getTutors() {
        return tutors;
    }

    public void setTutors(Set<TutorProfile> tutors) {
        this.tutors = tutors;
    }
}
