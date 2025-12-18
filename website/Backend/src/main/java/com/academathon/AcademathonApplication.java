package com.academathon;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class AcademathonApplication {

	public static void main(String[] args) {
		SpringApplication.run(AcademathonApplication.class, args);
	}
}

