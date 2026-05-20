package com.academathon.security;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.http.HttpMethod;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.academathon.jwt.JWTAuthenticationFilter;
import com.academathon.repository.UserRepository;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    private final UserRepository userRepository;

    // Only keep what doesn't cause a cycle
    public SecurityConfig(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // Use repo-backed UserDetailsService (ensure your User implements UserDetails or adapt)
    @Bean
    public UserDetailsService userDetailsService() {
        return username -> userRepository.findByEmail(username)
            .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }

    @Bean
    public AuthenticationProvider authenticationProvider(
            UserDetailsService userDetailsService,
            PasswordEncoder passwordEncoder
    ) {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setPasswordEncoder(passwordEncoder);
        provider.setUserDetailsService(userDetailsService);
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(
            HttpSecurity http,
            JWTAuthenticationFilter jwtAuthenticationFilter,   // ✅ inject as method param (no constructor cycle)
            AuthenticationProvider authenticationProvider,     // ✅ also method param
            CorsConfigurationSource corsConfigurationSource    // optional but neat
    ) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource))
            .authorizeHttpRequests(auth -> auth
                // Allow ALL OPTIONS preflight requests (CORS)
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                // expose your auth endpoints; tweak as needed
                .requestMatchers("/", "/login", "/auth/**", "/css/**", "/js/**", "/images/**", "/actuator/**").permitAll()
                // Allow public access to tutor invitation validation
                .requestMatchers("/api/tutor-invitations/validate/**").permitAll()
                .requestMatchers("/api/voice/token").permitAll()
                // Protect admin endpoints - require ADMIN role
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                // Allow authenticated users to access API endpoints
                .requestMatchers("/users/**", "/api/**").authenticated()
                .anyRequest().authenticated()
            )
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authenticationProvider(authenticationProvider)
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        // If you're using pure JWT, consider removing formLogin entirely.
        // If you keep it, remember it conflicts with stateless JWT sessions for most flows.
        // .formLogin(form -> form.loginPage("/login").defaultSuccessUrl("/home").failureUrl("/login?error").permitAll())
        // .logout(logout -> logout.logoutUrl("/logout").logoutSuccessUrl("/login?logout").permitAll());

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration cfg = new CorsConfiguration();
        // Allow frontend origins (localhost for dev, production domain)
        cfg.setAllowedOrigins(List.of(
            "http://localhost:3000",
            "http://localhost:5173",
            "http://localhost:5174",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:5173",
            "http://127.0.0.1:5174",
            // Production domains
            "https://academathon.ca",
            "https://www.academathon.ca",
            "https://academathon.com",
            "https://www.academathon.com",
            "https://academathon.vercel.app"
        ));
        // Allow all HTTP methods
        cfg.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        // Allow all headers
        cfg.setAllowedHeaders(List.of("*"));
        cfg.setAllowCredentials(true);
        cfg.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", cfg);
        return source;
    }
}