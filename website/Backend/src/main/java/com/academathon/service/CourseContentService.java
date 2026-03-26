package com.academathon.service;

import com.academathon.dto.CourseContentDTO;
import com.academathon.dto.UpdateCourseContentRequest;
import com.academathon.model.CourseContent;
import com.academathon.model.Subject;
import com.academathon.model.TutorProfile;
import com.academathon.repository.CourseContentRepository;
import com.academathon.repository.SubjectRepository;
import com.academathon.repository.TutorProfileRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CourseContentService {
    
    private final CourseContentRepository courseContentRepository;
    private final TutorProfileRepository tutorProfileRepository;
    private final SubjectRepository subjectRepository;
    
    public CourseContentService(CourseContentRepository courseContentRepository,
                               TutorProfileRepository tutorProfileRepository,
                               SubjectRepository subjectRepository) {
        this.courseContentRepository = courseContentRepository;
        this.tutorProfileRepository = tutorProfileRepository;
        this.subjectRepository = subjectRepository;
    }
    
    /**
     * Get course content by tutor profile ID and subject name
     */
    public CourseContentDTO getCourseContent(Long tutorProfileId, String subjectName) {
        // Find subject by name
        Subject subject = subjectRepository.findByName(subjectName)
            .orElse(null);
        
        if (subject == null) {
            return new CourseContentDTO(null, subjectName, null, "", "", null);
        }
        
        // Find course content or return empty content
        CourseContent content = courseContentRepository
            .findByTutorProfileIdAndSubjectId(tutorProfileId, subject.getId())
            .orElse(null);
        
        if (content == null) {
            // Return empty course content
            return new CourseContentDTO(null, subjectName, subject.getId(), "", "", null);
        }
        
        return new CourseContentDTO(
            content.getId(),
            subject.getName(),
            subject.getId(),
            content.getLessonPlan(),
            content.getSyllabus(),
            content.getUpdatedAt()
        );
    }
    
    /**
     * Update or create course content
     */
    @Transactional
    public CourseContentDTO updateCourseContent(Long tutorProfileId, UpdateCourseContentRequest request) {
        // Validate tutor profile
        TutorProfile tutorProfile = tutorProfileRepository.findById(tutorProfileId)
            .orElseThrow(() -> new RuntimeException("Tutor profile not found"));
        
        // Find or create subject
        Subject subject = subjectRepository.findByName(request.getSubjectName())
            .orElseThrow(() -> new RuntimeException("Subject not found: " + request.getSubjectName()));
        
        // Find existing content or create new
        CourseContent content = courseContentRepository
            .findByTutorProfileIdAndSubjectId(tutorProfileId, subject.getId())
            .orElse(new CourseContent(tutorProfile, subject));
        
        // Update content
        content.setLessonPlan(request.getLessonPlan());
        content.setSyllabus(request.getSyllabus());
        
        // Save
        content = courseContentRepository.save(content);
        
        return new CourseContentDTO(
            content.getId(),
            subject.getName(),
            subject.getId(),
            content.getLessonPlan(),
            content.getSyllabus(),
            content.getUpdatedAt()
        );
    }
}




