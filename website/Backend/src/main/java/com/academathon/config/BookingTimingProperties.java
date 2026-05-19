package com.academathon.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Centralizes booking-related timing configuration so the values defined in
 * application.properties are the single source of truth.
 *
 * All deadlines are expressed as "hours before lesson start" except for
 * {@link #minimumAdvanceHours}, which is the minimum gap between booking creation
 * and the lesson start.
 *
 * Backend services inject this bean to compute deadlines, and the
 * GET /api/bookings/timing-config endpoint serializes it to JSON for the frontend.
 */
@Component
public class BookingTimingProperties {

    @Value("${booking.minimum.advance.hours:5}")
    private long minimumAdvanceHours;

    @Value("${booking.tutor.response.before.lesson.hours:3}")
    private long tutorResponseBeforeLessonHours;

    @Value("${booking.reschedule.request.before.lesson.hours:2}")
    private long rescheduleRequestBeforeLessonHours;

    @Value("${booking.reschedule.response.before.lesson.hours:1}")
    private long rescheduleResponseBeforeLessonHours;

    @Value("${booking.cancellation.before.lesson.hours:1}")
    private long cancellationBeforeLessonHours;

    public long getMinimumAdvanceHours() {
        return minimumAdvanceHours;
    }

    public long getTutorResponseBeforeLessonHours() {
        return tutorResponseBeforeLessonHours;
    }

    public long getRescheduleRequestBeforeLessonHours() {
        return rescheduleRequestBeforeLessonHours;
    }

    public long getRescheduleResponseBeforeLessonHours() {
        return rescheduleResponseBeforeLessonHours;
    }

    public long getCancellationBeforeLessonHours() {
        return cancellationBeforeLessonHours;
    }
}
