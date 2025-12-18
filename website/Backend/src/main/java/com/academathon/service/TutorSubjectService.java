package com.academathon.service;

import com.academathon.dto.TutorSubjectDTO;
import com.academathon.model.Subject;
import com.academathon.model.TutorProfile;
import com.academathon.repository.SubjectRepository;
import com.academathon.repository.TutorProfileRepository;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class TutorSubjectService {
    
    private final TutorProfileRepository tutorProfileRepository;
    private final SubjectRepository subjectRepository;
    private final JdbcTemplate jdbcTemplate;
    
    public TutorSubjectService(TutorProfileRepository tutorProfileRepository,
                               SubjectRepository subjectRepository,
                               JdbcTemplate jdbcTemplate) {
        this.tutorProfileRepository = tutorProfileRepository;
        this.subjectRepository = subjectRepository;
        this.jdbcTemplate = jdbcTemplate;
    }
    
    /**
     * Get all subjects for a tutor with their status
     */
    public List<TutorSubjectDTO> getTutorSubjects(Long tutorProfileId) {
        String sql = "SELECT s.id, s.name, ts.status, ts.added_date, ts.removed_date " +
                    "FROM subjects s " +
                    "JOIN tutor_subjects ts ON s.id = ts.subject_id " +
                    "WHERE ts.tutor_profile_id = ? " +
                    "ORDER BY ts.added_date DESC";
        
        return jdbcTemplate.query(sql, (rs, rowNum) -> new TutorSubjectDTO(
            rs.getLong("id"),
            rs.getString("name"),
            rs.getString("status"),
            rs.getTimestamp("added_date") != null ? rs.getTimestamp("added_date").toLocalDateTime() : null,
            rs.getTimestamp("removed_date") != null ? rs.getTimestamp("removed_date").toLocalDateTime() : null
        ), tutorProfileId);
    }
    
    /**
     * Get subjects by status
     */
    public List<TutorSubjectDTO> getTutorSubjectsByStatus(Long tutorProfileId, String status) {
        String sql = "SELECT s.id, s.name, ts.status, ts.added_date, ts.removed_date " +
                    "FROM subjects s " +
                    "JOIN tutor_subjects ts ON s.id = ts.subject_id " +
                    "WHERE ts.tutor_profile_id = ? AND ts.status = ? " +
                    "ORDER BY ts.added_date DESC";
        
        return jdbcTemplate.query(sql, (rs, rowNum) -> new TutorSubjectDTO(
            rs.getLong("id"),
            rs.getString("name"),
            rs.getString("status"),
            rs.getTimestamp("added_date") != null ? rs.getTimestamp("added_date").toLocalDateTime() : null,
            rs.getTimestamp("removed_date") != null ? rs.getTimestamp("removed_date").toLocalDateTime() : null
        ), tutorProfileId, status);
    }
    
    /**
     * Add a subject to tutor's teaching list
     */
    @Transactional
    public TutorSubjectDTO addSubject(Long tutorProfileId, String subjectName, String status) {
        // Validate tutor exists
        tutorProfileRepository.findById(tutorProfileId)
            .orElseThrow(() -> new RuntimeException("Tutor profile not found"));
        
        // Find or create subject
        Subject subject = subjectRepository.findByName(subjectName)
            .orElseGet(() -> subjectRepository.save(new Subject(subjectName)));
        
        // Check if already exists
        String checkSql = "SELECT COUNT(*) FROM tutor_subjects WHERE tutor_profile_id = ? AND subject_id = ?";
        Integer count = jdbcTemplate.queryForObject(checkSql, Integer.class, tutorProfileId, subject.getId());
        
        if (count != null && count > 0) {
            throw new RuntimeException("Subject already added to your teaching list");
        }
        
        // Insert with status
        String insertSql = "INSERT INTO tutor_subjects (tutor_profile_id, subject_id, status, added_date) VALUES (?, ?, ?, NOW())";
        jdbcTemplate.update(insertSql, tutorProfileId, subject.getId(), status);
        
        return new TutorSubjectDTO(
            subject.getId(),
            subject.getName(),
            status,
            LocalDateTime.now(),
            null
        );
    }
    
    /**
     * Update subject status
     */
    @Transactional
    public TutorSubjectDTO updateSubjectStatus(Long tutorProfileId, Long subjectId, String newStatus) {
        // Verify tutor owns this subject
        String checkSql = "SELECT COUNT(*) FROM tutor_subjects WHERE tutor_profile_id = ? AND subject_id = ?";
        Integer count = jdbcTemplate.queryForObject(checkSql, Integer.class, tutorProfileId, subjectId);
        
        if (count == null || count == 0) {
            throw new RuntimeException("Subject not found in your teaching list");
        }
        
        // Update status
        String updateSql = "UPDATE tutor_subjects SET status = ?, removed_date = ? WHERE tutor_profile_id = ? AND subject_id = ?";
        LocalDateTime removedDate = "PAST".equals(newStatus) ? LocalDateTime.now() : null;
        jdbcTemplate.update(updateSql, newStatus, removedDate, tutorProfileId, subjectId);
        
        // Get subject name
        Subject subject = subjectRepository.findById(subjectId)
            .orElseThrow(() -> new RuntimeException("Subject not found"));
        
        // Get added date
        String dateSql = "SELECT added_date FROM tutor_subjects WHERE tutor_profile_id = ? AND subject_id = ?";
        LocalDateTime addedDate = jdbcTemplate.queryForObject(dateSql, LocalDateTime.class, tutorProfileId, subjectId);
        
        return new TutorSubjectDTO(
            subject.getId(),
            subject.getName(),
            newStatus,
            addedDate,
            removedDate
        );
    }
    
    /**
     * Remove a subject from tutor's teaching list
     */
    @Transactional
    public void removeSubject(Long tutorProfileId, Long subjectId) {
        // Verify tutor owns this subject
        String checkSql = "SELECT COUNT(*) FROM tutor_subjects WHERE tutor_profile_id = ? AND subject_id = ?";
        Integer count = jdbcTemplate.queryForObject(checkSql, Integer.class, tutorProfileId, subjectId);
        
        if (count == null || count == 0) {
            throw new RuntimeException("Subject not found in your teaching list");
        }
        
        // Delete the relationship
        String deleteSql = "DELETE FROM tutor_subjects WHERE tutor_profile_id = ? AND subject_id = ?";
        jdbcTemplate.update(deleteSql, tutorProfileId, subjectId);
    }
}

