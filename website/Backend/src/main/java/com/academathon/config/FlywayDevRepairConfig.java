package com.academathon.config;

import jakarta.annotation.PostConstruct;
import org.flywaydb.core.Flyway;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

/**
 * Dev-only bootstrap that performs Flyway.repair() before validate/migrate.
 * Use it by running the app with the 'dev' profile:
 *   ./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
 *
 * This avoids startup failure when a checksum mismatch exists in local/dev DBs.
 * Do NOT enable in production.
 */
@Configuration
@Profile("dev")
public class FlywayDevRepairConfig {
    private static final Logger log = LoggerFactory.getLogger(FlywayDevRepairConfig.class);
    private final Flyway flyway;

    public FlywayDevRepairConfig(Flyway flyway) {
        this.flyway = flyway;
    }

    @PostConstruct
    public void repairBeforeMigrate() {
        try {
            log.warn("DEV PROFILE: Running Flyway.repair() automatically before migration...");
            flyway.repair();
        } catch (Exception ex) {
            log.error("DEV PROFILE: Flyway.repair() failed", ex);
            // Let Spring continue; migrate may still give a clearer error.
        }
    }
}