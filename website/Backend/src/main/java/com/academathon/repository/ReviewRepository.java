package com.academathon.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.academathon.model.Review;

public interface ReviewRepository extends JpaRepository<Review, Long> {
}