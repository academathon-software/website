package com.academathon.service;

import com.academathon.dto.BookingStatisticsDTO;
import com.academathon.dto.PlatformStatisticsDTO;
import com.academathon.dto.UserStatisticsDTO;
import com.academathon.model.Booking;
import com.academathon.model.User;
import com.academathon.repository.BookingRepository;
import com.academathon.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AdminStatisticsService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private BookingRepository bookingRepository;
    
    public PlatformStatisticsDTO getPlatformStatistics() {
        try {
            // User statistics
            List<User> allUsers = userRepository.findAll();
            if (allUsers == null) {
                allUsers = new java.util.ArrayList<>();
            }
            long totalUsers = allUsers.size();
            long totalStudents = allUsers.stream().filter(u -> u.getRole() == User.Role.STUDENT).count();
            long totalTutors = allUsers.stream().filter(u -> u.getRole() == User.Role.TUTOR).count();
            long activeStudents = allUsers.stream()
                .filter(u -> u.getRole() == User.Role.STUDENT && u.isEnabled())
                .count();
            long activeTutors = allUsers.stream()
                .filter(u -> u.getRole() == User.Role.TUTOR && u.isEnabled())
                .count();
        
            // Booking statistics
            List<Booking> allBookings = bookingRepository.findAll();
            if (allBookings == null) {
                allBookings = new java.util.ArrayList<>();
            }
            long totalBookings = allBookings.size();
        long completedBookings = allBookings.stream()
            .filter(b -> b.getStatus() == Booking.BookingStatus.COMPLETED)
            .count();
        long pendingBookings = allBookings.stream()
            .filter(b -> b.getStatus() == Booking.BookingStatus.PENDING)
            .count();
        long cancelledBookings = allBookings.stream()
            .filter(b -> b.getStatus() == Booking.BookingStatus.CANCELLED)
            .count();
        
        // Revenue statistics
        Double totalRevenue = allBookings.stream()
            .filter(b -> b.getAmount() != null)
            .mapToDouble(Booking::getAmount)
            .sum();
        
        Double averageBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0.0;
        
        // Growth rates (comparing last 30 days to previous 30 days)
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime thirtyDaysAgo = now.minusDays(30);
        LocalDateTime sixtyDaysAgo = now.minusDays(60);
        
        long recentUsers = allUsers.stream()
            .filter(u -> u.getCreatedAt() != null && u.getCreatedAt().isAfter(thirtyDaysAgo))
            .count();
        long previousUsers = allUsers.stream()
            .filter(u -> u.getCreatedAt() != null && 
                   u.getCreatedAt().isAfter(sixtyDaysAgo) && 
                   u.getCreatedAt().isBefore(thirtyDaysAgo))
            .count();
        
        double userGrowthRate = previousUsers > 0 ? 
            ((double)(recentUsers - previousUsers) / previousUsers) * 100 : 0.0;
        
        long recentBookings = allBookings.stream()
            .filter(b -> b.getCreatedAt() != null && b.getCreatedAt().isAfter(thirtyDaysAgo))
            .count();
        long previousBookings = allBookings.stream()
            .filter(b -> b.getCreatedAt() != null && 
                   b.getCreatedAt().isAfter(sixtyDaysAgo) && 
                   b.getCreatedAt().isBefore(thirtyDaysAgo))
            .count();
        
            double bookingGrowthRate = previousBookings > 0 ? 
                ((double)(recentBookings - previousBookings) / previousBookings) * 100 : 0.0;
            
            return new PlatformStatisticsDTO(
                totalUsers, totalStudents, totalTutors, activeStudents, activeTutors,
                totalBookings, completedBookings, pendingBookings, cancelledBookings,
                totalRevenue, averageBookingValue, userGrowthRate, bookingGrowthRate
            );
        } catch (Exception e) {
            // Return default statistics if there's an error
            System.err.println("Error calculating platform statistics: " + e.getMessage());
            e.printStackTrace();
            return new PlatformStatisticsDTO(
                0L, 0L, 0L, 0L, 0L, 0L, 0L, 0L, 0L, 0.0, 0.0, 0.0, 0.0
            );
        }
    }
    
    public UserStatisticsDTO getUserStatistics() {
        try {
            List<User> allUsers = userRepository.findAll();
            if (allUsers == null) {
                allUsers = new java.util.ArrayList<>();
            }
            
            UserStatisticsDTO stats = new UserStatisticsDTO();
        stats.setTotalUsers((long) allUsers.size());
        stats.setTotalStudents(allUsers.stream().filter(u -> u.getRole() == User.Role.STUDENT).count());
        stats.setTotalTutors(allUsers.stream().filter(u -> u.getRole() == User.Role.TUTOR).count());
        stats.setTotalAdmins(allUsers.stream().filter(u -> u.getRole() == User.Role.ADMIN).count());
        stats.setActiveUsers(allUsers.stream().filter(User::isEnabled).count());
        stats.setInactiveUsers(allUsers.stream().filter(u -> !u.isEnabled()).count());
        
        // Group users by month
        DateTimeFormatter monthFormatter = DateTimeFormatter.ofPattern("yyyy-MM");
        Map<String, Long> usersByMonth = allUsers.stream()
            .filter(u -> u.getCreatedAt() != null)
            .collect(Collectors.groupingBy(
                u -> u.getCreatedAt().format(monthFormatter),
                Collectors.counting()
            ));
        stats.setUsersByMonth(usersByMonth);
        
        // Calculate monthly growth rate
        LocalDateTime now = LocalDateTime.now();
        long thisMonth = allUsers.stream()
            .filter(u -> u.getCreatedAt() != null && 
                   u.getCreatedAt().isAfter(now.minusMonths(1)))
            .count();
        long lastMonth = allUsers.stream()
            .filter(u -> u.getCreatedAt() != null && 
                   u.getCreatedAt().isAfter(now.minusMonths(2)) &&
                   u.getCreatedAt().isBefore(now.minusMonths(1)))
            .count();
        double monthlyGrowthRate = lastMonth > 0 ? 
            ((double)(thisMonth - lastMonth) / lastMonth) * 100 : 0.0;
        stats.setMonthlyGrowthRate(monthlyGrowthRate);
        
        // Oldest and newest users
        allUsers.stream()
            .filter(u -> u.getCreatedAt() != null)
            .min((u1, u2) -> u1.getCreatedAt().compareTo(u2.getCreatedAt()))
            .ifPresent(u -> stats.setOldestUserDate(u.getCreatedAt()));
        
            allUsers.stream()
                .filter(u -> u.getCreatedAt() != null)
                .max((u1, u2) -> u1.getCreatedAt().compareTo(u2.getCreatedAt()))
                .ifPresent(u -> stats.setNewestUserDate(u.getCreatedAt()));
            
            return stats;
        } catch (Exception e) {
            System.err.println("Error calculating user statistics: " + e.getMessage());
            e.printStackTrace();
            UserStatisticsDTO stats = new UserStatisticsDTO();
            stats.setTotalUsers(0L);
            stats.setTotalStudents(0L);
            stats.setTotalTutors(0L);
            stats.setTotalAdmins(0L);
            stats.setActiveUsers(0L);
            stats.setInactiveUsers(0L);
            stats.setMonthlyGrowthRate(0.0);
            return stats;
        }
    }
    
    public BookingStatisticsDTO getBookingStatistics() {
        try {
            List<Booking> allBookings = bookingRepository.findAll();
            if (allBookings == null) {
                allBookings = new java.util.ArrayList<>();
            }
            
            BookingStatisticsDTO stats = new BookingStatisticsDTO();
        stats.setTotalBookings((long) allBookings.size());
        stats.setCompletedBookings(allBookings.stream()
            .filter(b -> b.getStatus() == Booking.BookingStatus.COMPLETED).count());
        stats.setPendingBookings(allBookings.stream()
            .filter(b -> b.getStatus() == Booking.BookingStatus.PENDING).count());
        stats.setScheduledBookings(allBookings.stream()
            .filter(b -> b.getStatus() == Booking.BookingStatus.SCHEDULED).count());
        stats.setCancelledBookings(allBookings.stream()
            .filter(b -> b.getStatus() == Booking.BookingStatus.CANCELLED).count());
        stats.setRejectedBookings(allBookings.stream()
            .filter(b -> b.getStatus() == Booking.BookingStatus.REJECTED).count());
        
        // Calculate rates
        long total = allBookings.size();
        if (total > 0) {
            stats.setCompletionRate((double) stats.getCompletedBookings() / total * 100);
            stats.setCancellationRate((double) stats.getCancelledBookings() / total * 100);
        } else {
            stats.setCompletionRate(0.0);
            stats.setCancellationRate(0.0);
        }
        
        // Group bookings by month
        DateTimeFormatter monthFormatter = DateTimeFormatter.ofPattern("yyyy-MM");
        Map<String, Long> bookingsByMonth = allBookings.stream()
            .filter(b -> b.getCreatedAt() != null)
            .collect(Collectors.groupingBy(
                b -> b.getCreatedAt().format(monthFormatter),
                Collectors.counting()
            ));
        stats.setBookingsByMonth(bookingsByMonth);
        
        // Group bookings by subject
        Map<String, Long> bookingsBySubject = allBookings.stream()
            .filter(b -> b.getSubject() != null)
            .collect(Collectors.groupingBy(
                Booking::getSubject,
                Collectors.counting()
            ));
        stats.setBookingsBySubject(bookingsBySubject);
        
        // Revenue statistics
        Double totalRevenue = allBookings.stream()
            .filter(b -> b.getAmount() != null)
            .mapToDouble(Booking::getAmount)
            .sum();
        stats.setTotalRevenue(totalRevenue);
        
            Double averageBookingValue = total > 0 ? totalRevenue / total : 0.0;
            stats.setAverageBookingValue(averageBookingValue);
            
            return stats;
        } catch (Exception e) {
            System.err.println("Error calculating booking statistics: " + e.getMessage());
            e.printStackTrace();
            BookingStatisticsDTO stats = new BookingStatisticsDTO();
            stats.setTotalBookings(0L);
            stats.setCompletedBookings(0L);
            stats.setPendingBookings(0L);
            stats.setScheduledBookings(0L);
            stats.setCancelledBookings(0L);
            stats.setRejectedBookings(0L);
            stats.setCompletionRate(0.0);
            stats.setCancellationRate(0.0);
            stats.setTotalRevenue(0.0);
            stats.setAverageBookingValue(0.0);
            return stats;
        }
    }
}

