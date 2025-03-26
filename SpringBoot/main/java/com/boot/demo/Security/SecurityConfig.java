package com.boot.demo.Security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                    .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll() // ✅ Allow preflight requests
                .requestMatchers("/auth/**").permitAll()  // ✅ Allow login & logout
                .requestMatchers("/api/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/plans/**").authenticated()  // ✅ Only admin can add plans
                .requestMatchers(HttpMethod.POST, "/api/support-tickets/**").authenticated()
                .requestMatchers("/api/support-tickets/**").authenticated()
                .requestMatchers("/api/recharge-history/**").authenticated() // ✅ Allow authenticated users
                .requestMatchers("/api/users/**").authenticated() // ✅ Require authentication
                .requestMatchers("/api/admin/**").hasAuthority("ROLE_ADMIN")  // Admin access
                .requestMatchers("/user/**").hasAnyAuthority("ROLE_USER", "ROLE_ADMIN")  // User access
                .anyRequest().authenticated()  // Everything else requires authentication
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

}
