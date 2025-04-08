package com.backend.irevix.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;


@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .authorizeHttpRequests(authz -> authz
                        .requestMatchers("/uploads/**").permitAll() // ⬅️ statik görsel klasörü
                        .anyRequest().authenticated()
                )
                .csrf(csrf -> csrf.disable()); // CSRF'yi devre dışı bırak (form submit yoksa güvenlidir)

        return http.build();
    }
}
