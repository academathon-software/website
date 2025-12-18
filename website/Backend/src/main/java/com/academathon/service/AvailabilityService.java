package com.academathon.service;

import com.academathon.dto.*;
import com.academathon.model.*;
import com.academathon.model.AvailabilityException.ExceptionType;
import com.academathon.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.*;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AvailabilityService {
    
    private final AvailabilityScheduleRepository scheduleRepository;
    private final AvailabilityExceptionRepository exceptionRepository;
    private final TutorProfileRepository tutorProfileRepository;
    private final BookingRepository bookingRepository;
    
    public AvailabilityService(AvailabilityScheduleRepository scheduleRepository,
                              AvailabilityExceptionRepository exceptionRepository,
                              TutorProfileRepository tutorProfileRepository,
                              BookingRepository bookingRepository) {
        this.scheduleRepository = scheduleRepository;
        this.exceptionRepository = exceptionRepository;
        this.tutorProfileRepository = tutorProfileRepository;
        this.bookingRepository = bookingRepository;
    }
    
    /**
     * Set recurring weekly schedule for a tutor
     */
    @Transactional
    public List<AvailabilityScheduleDTO> setRecurringSchedule(Long tutorProfileId, 
                                                               SetAvailabilityScheduleRequest request) {
        TutorProfile tutor = tutorProfileRepository.findById(tutorProfileId)
            .orElseThrow(() -> new RuntimeException("Tutor profile not found"));
        
        // Delete existing schedules
        scheduleRepository.deleteByTutorProfile(tutor);
        
        // Create new schedules
        List<AvailabilitySchedule> schedules = new ArrayList<>();
        for (SetAvailabilityScheduleRequest.ScheduleEntry entry : request.getSchedules()) {
            AvailabilitySchedule schedule = new AvailabilitySchedule(
                tutor,
                entry.getDayOfWeek(),
                entry.getStartTime(),
                entry.getEndTime()
            );
            schedule.setIsActive(entry.getIsActive() != null ? entry.getIsActive() : true);
            schedules.add(schedule);
        }
        
        List<AvailabilitySchedule> saved = scheduleRepository.saveAll(schedules);
        
        return saved.stream()
            .map(this::toScheduleDTO)
            .collect(Collectors.toList());
    }
    
    /**
     * Get tutor's recurring schedule
     */
    public List<AvailabilityScheduleDTO> getSchedule(Long tutorProfileId) {
        List<AvailabilitySchedule> schedules = scheduleRepository.findActiveByTutorProfileId(tutorProfileId);
        return schedules.stream()
            .map(this::toScheduleDTO)
            .collect(Collectors.toList());
    }
    
    /**
     * Add an availability exception (one-off available or blocked time)
     */
    @Transactional
    public AvailabilityExceptionDTO addException(Long tutorProfileId, 
                                                  AddAvailabilityExceptionRequest request) {
        TutorProfile tutor = tutorProfileRepository.findById(tutorProfileId)
            .orElseThrow(() -> new RuntimeException("Tutor profile not found"));
        
        ExceptionType type;
        try {
            type = ExceptionType.valueOf(request.getType().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid exception type. Must be AVAILABLE or BLOCKED");
        }
        
        AvailabilityException exception = new AvailabilityException(
            tutor,
            request.getExceptionDate(),
            request.getStartTime(),
            request.getEndTime(),
            type,
            request.getReason()
        );
        
        AvailabilityException saved = exceptionRepository.save(exception);
        return toExceptionDTO(saved);
    }
    
    /**
     * Get all exceptions for a tutor
     */
    public List<AvailabilityExceptionDTO> getExceptions(Long tutorProfileId) {
        List<AvailabilityException> exceptions = exceptionRepository.findByTutorProfileId(tutorProfileId);
        return exceptions.stream()
            .map(this::toExceptionDTO)
            .collect(Collectors.toList());
    }
    
    /**
     * Remove an exception
     */
    @Transactional
    public void removeException(Long exceptionId, Long tutorProfileId) {
        AvailabilityException exception = exceptionRepository.findById(exceptionId)
            .orElseThrow(() -> new RuntimeException("Exception not found"));
        
        if (!exception.getTutorProfile().getId().equals(tutorProfileId)) {
            throw new RuntimeException("You can only delete your own availability exceptions");
        }
        
        exceptionRepository.delete(exception);
    }
    
    /**
     * Calculate available time slots for booking
     */
    public List<AvailableSlotDTO> getAvailableSlots(Long tutorProfileId, 
                                                     LocalDate startDate, 
                                                     LocalDate endDate, 
                                                     Integer durationMinutes) {
        // Validate inputs
        if (durationMinutes < 30) {
            throw new RuntimeException("Minimum booking duration is 30 minutes");
        }
        
        // Verify tutor exists
        if (!tutorProfileRepository.existsById(tutorProfileId)) {
            throw new RuntimeException("Tutor profile not found");
        }
        
        // Get recurring schedule
        List<AvailabilitySchedule> recurringSchedule = scheduleRepository.findActiveByTutorProfileId(tutorProfileId);
        
        // Get exceptions in date range
        List<AvailabilityException> exceptions = exceptionRepository.findByTutorProfileIdAndDateRange(
            tutorProfileId, startDate, endDate
        );
        
        // Get existing bookings in date range
        LocalDateTime rangeStart = startDate.atStartOfDay();
        LocalDateTime rangeEnd = endDate.atTime(23, 59, 59);
        List<Booking> bookings = bookingRepository.findConflictingBookings(
            tutorProfileId, rangeStart, rangeEnd
        );
        
        // Calculate available slots
        List<AvailableSlotDTO> availableSlots = new ArrayList<>();
        
        for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
            List<TimeSlot> daySlots = calculateDayAvailability(
                date, recurringSchedule, exceptions, bookings, durationMinutes
            );
            
            for (TimeSlot slot : daySlots) {
                availableSlots.add(new AvailableSlotDTO(
                    slot.start,
                    slot.end,
                    durationMinutes
                ));
            }
        }
        
        return availableSlots;
    }
    
    /**
     * Calculate available slots for a specific date
     */
    private List<TimeSlot> calculateDayAvailability(LocalDate date,
                                                     List<AvailabilitySchedule> recurringSchedule,
                                                     List<AvailabilityException> exceptions,
                                                     List<Booking> bookings,
                                                     Integer durationMinutes) {
        int dayOfWeek = date.getDayOfWeek().getValue() % 7; // Convert to 0-6 (Sunday=0)
        
        // Get base availability from recurring schedule
        List<TimeSlot> baseSlots = recurringSchedule.stream()
            .filter(s -> s.getDayOfWeek().equals(dayOfWeek))
            .map(s -> new TimeSlot(
                LocalDateTime.of(date, s.getStartTime()),
                LocalDateTime.of(date, s.getEndTime())
            ))
            .collect(Collectors.toList());
        
        // Apply exceptions for this date
        List<AvailabilityException> dayExceptions = exceptions.stream()
            .filter(e -> e.getExceptionDate().equals(date))
            .collect(Collectors.toList());
        
        List<TimeSlot> slotsWithExceptions = new ArrayList<>(baseSlots);
        
        for (AvailabilityException exception : dayExceptions) {
            TimeSlot exceptionSlot = new TimeSlot(
                LocalDateTime.of(date, exception.getStartTime()),
                LocalDateTime.of(date, exception.getEndTime())
            );
            
            if (exception.getType() == ExceptionType.AVAILABLE) {
                // Add this time as available
                slotsWithExceptions.add(exceptionSlot);
            } else if (exception.getType() == ExceptionType.BLOCKED) {
                // Remove this time from available slots
                slotsWithExceptions = removeTimeSlot(slotsWithExceptions, exceptionSlot);
            }
        }
        
        // Remove booked times
        List<Booking> dayBookings = bookings.stream()
            .filter(b -> b.getStartTime().toLocalDate().equals(date))
            .filter(b -> b.getStatus() == Booking.BookingStatus.CONFIRMED || 
                        b.getStatus() == Booking.BookingStatus.PENDING)
            .collect(Collectors.toList());
        
        for (Booking booking : dayBookings) {
            TimeSlot bookedSlot = new TimeSlot(booking.getStartTime(), booking.getEndTime());
            slotsWithExceptions = removeTimeSlot(slotsWithExceptions, bookedSlot);
        }
        
        // Merge overlapping slots
        slotsWithExceptions = mergeTimeSlots(slotsWithExceptions);
        
        // Split into bookable slots of specified duration
        List<TimeSlot> bookableSlots = new ArrayList<>();
        for (TimeSlot slot : slotsWithExceptions) {
            bookableSlots.addAll(splitIntoBookableSlots(slot, durationMinutes));
        }
        
        return bookableSlots;
    }
    
    /**
     * Remove a time slot from a list of slots (handles partial overlaps)
     */
    private List<TimeSlot> removeTimeSlot(List<TimeSlot> slots, TimeSlot toRemove) {
        List<TimeSlot> result = new ArrayList<>();
        
        for (TimeSlot slot : slots) {
            // No overlap
            if (slot.end.isBefore(toRemove.start) || slot.end.equals(toRemove.start) ||
                slot.start.isAfter(toRemove.end) || slot.start.equals(toRemove.end)) {
                result.add(slot);
            }
            // Partial overlap - keep non-overlapping parts
            else {
                if (slot.start.isBefore(toRemove.start)) {
                    result.add(new TimeSlot(slot.start, toRemove.start));
                }
                if (slot.end.isAfter(toRemove.end)) {
                    result.add(new TimeSlot(toRemove.end, slot.end));
                }
            }
        }
        
        return result;
    }
    
    /**
     * Merge overlapping time slots
     */
    private List<TimeSlot> mergeTimeSlots(List<TimeSlot> slots) {
        if (slots.isEmpty()) return slots;
        
        List<TimeSlot> sorted = new ArrayList<>(slots);
        sorted.sort(Comparator.comparing(s -> s.start));
        
        List<TimeSlot> merged = new ArrayList<>();
        TimeSlot current = sorted.get(0);
        
        for (int i = 1; i < sorted.size(); i++) {
            TimeSlot next = sorted.get(i);
            
            // Overlapping or adjacent
            if (!current.end.isBefore(next.start)) {
                current = new TimeSlot(
                    current.start,
                    current.end.isAfter(next.end) ? current.end : next.end
                );
            } else {
                merged.add(current);
                current = next;
            }
        }
        merged.add(current);
        
        return merged;
    }
    
    /**
     * Split a time slot into bookable slots of specified duration
     */
    private List<TimeSlot> splitIntoBookableSlots(TimeSlot slot, Integer durationMinutes) {
        List<TimeSlot> bookableSlots = new ArrayList<>();
        
        LocalDateTime currentStart = slot.start;
        while (currentStart.plusMinutes(durationMinutes).isBefore(slot.end) ||
               currentStart.plusMinutes(durationMinutes).equals(slot.end)) {
            LocalDateTime currentEnd = currentStart.plusMinutes(durationMinutes);
            bookableSlots.add(new TimeSlot(currentStart, currentEnd));
            currentStart = currentEnd;
        }
        
        return bookableSlots;
    }
    
    /**
     * Check if a tutor is available at a specific time
     */
    public boolean isAvailable(Long tutorProfileId, LocalDateTime startTime, LocalDateTime endTime) {
        List<AvailableSlotDTO> slots = getAvailableSlots(
            tutorProfileId,
            startTime.toLocalDate(),
            endTime.toLocalDate(),
            (int) Duration.between(startTime, endTime).toMinutes()
        );
        
        // Check if requested time exactly matches any available slot
        for (AvailableSlotDTO slot : slots) {
            if (slot.startTime().equals(startTime) && slot.endTime().equals(endTime)) {
                return true;
            }
        }
        
        return false;
    }
    
    // Helper classes
    private static class TimeSlot {
        LocalDateTime start;
        LocalDateTime end;
        
        TimeSlot(LocalDateTime start, LocalDateTime end) {
            this.start = start;
            this.end = end;
        }
    }
    
    // DTO Mappers
    private AvailabilityScheduleDTO toScheduleDTO(AvailabilitySchedule schedule) {
        return new AvailabilityScheduleDTO(
            schedule.getId(),
            schedule.getTutorProfile().getId(),
            schedule.getDayOfWeek(),
            schedule.getStartTime(),
            schedule.getEndTime(),
            schedule.getIsActive()
        );
    }
    
    private AvailabilityExceptionDTO toExceptionDTO(AvailabilityException exception) {
        return new AvailabilityExceptionDTO(
            exception.getId(),
            exception.getTutorProfile().getId(),
            exception.getExceptionDate(),
            exception.getStartTime(),
            exception.getEndTime(),
            exception.getType().name(),
            exception.getReason()
        );
    }
}

