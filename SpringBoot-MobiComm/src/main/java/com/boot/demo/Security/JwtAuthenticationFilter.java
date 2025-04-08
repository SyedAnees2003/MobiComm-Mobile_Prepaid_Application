package com.boot.demo.Security;

import com.boot.demo.Model.User;
import com.boot.demo.Repository.RevokedTokenRepository;
import com.boot.demo.Repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private RevokedTokenRepository revokedTokenRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        String token = request.getHeader("Authorization");

        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7); // Remove "Bearer " prefix
            System.out.println("🔹 Received Token: " + token);

            if (jwtUtil.isTokenExpired(token)) {
                System.out.println("❌ Token is expired");
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.getWriter().write("Invalid or expired token.");
                return;
            }

            if (revokedTokenRepository.findByToken(token).isPresent()) {
                System.out.println("❌ Token has been revoked");
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.getWriter().write("Token has been revoked.");
                return;
            }

            // Get user details from token
            String mobileNumber = jwtUtil.getUsernameFromToken(token); 
            String role = jwtUtil.getRoleFromToken(token);

            Optional<User> user = userRepository.findByMobileNumber(mobileNumber);

            if (user.isPresent()) {
                List<SimpleGrantedAuthority> authorities = Collections.singletonList(new SimpleGrantedAuthority(role));
                SecurityContextHolder.getContext().setAuthentication(
                    new UsernamePasswordAuthenticationToken(mobileNumber, null, authorities)
                );
            }
        }

        chain.doFilter(request, response);
    }

    }
