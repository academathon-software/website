package com.academathon.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.academathon.model.Subject;

public interface SubjectRepository extends JpaRepository<Subject, Long> {

    Optional<Subject> findByName(String name);
}
