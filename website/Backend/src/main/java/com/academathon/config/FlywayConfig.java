package com.academathon.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.flyway.FlywayMigrationStrategy;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Replaces Spring Boot's default Flyway migration strategy (which just calls
 * {@code flyway.migrate()}) with one that runs {@code repair()} first.
 *
 * <p>Why: Flyway stores a checksum of every applied migration in
 * {@code flyway_schema_history}. If the byte content of an already-applied
 * migration file drifts -- e.g. a CRLF/LF flip between a Windows working copy
 * and a Linux deploy, or an editor stripping trailing whitespace -- Flyway
 * refuses to start with a "checksum mismatch" error. {@code repair()} simply
 * realigns the stored checksum with the current file's checksum. It does NOT
 * re-run any SQL and does NOT touch user data, so it is safe to call on every
 * boot.
 *
 * <p>This is the supported Spring Boot pattern for the behavior; there is no
 * {@code spring.flyway.repair-on-migrate} property (despite what some blog
 * posts claim -- {@code FlywayProperties} doesn't expose one in any Spring
 * Boot 3.x release).
 */
@Configuration
public class FlywayConfig {

    private static final Logger log = LoggerFactory.getLogger(FlywayConfig.class);

    @Bean
    public FlywayMigrationStrategy repairThenMigrate() {
        return flyway -> {
            try {
                flyway.repair();
            } catch (Exception ex) {
                // Don't block startup just because repair complained; migrate()
                // will produce a clearer error if there's a real schema problem.
                log.warn("Flyway.repair() failed; continuing to migrate(): {}", ex.getMessage());
            }
            flyway.migrate();
        };
    }
}
