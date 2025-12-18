package com.academathon.repository;

import com.academathon.model.CourseContent;
import com.academathon.model.Subject;
import com.academathon.model.TutorProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CourseContentRepository extends JpaRepository<CourseContent, Long> {
    
    Optional<CourseContent> findByTutorProfileAndSubject(TutorProfile tutorProfile, Subject subject);
    
    Optional<CourseContent> findByTutorProfileIdAndSubjectId(Long tutorProfileId, Long subjectId);
}




