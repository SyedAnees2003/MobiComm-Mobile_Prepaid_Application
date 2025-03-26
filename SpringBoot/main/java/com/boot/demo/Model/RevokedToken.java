package com.boot.demo.Model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "revoked_tokens")
public class RevokedToken {
    
	 @Id
	    @GeneratedValue(strategy = GenerationType.IDENTITY)
	    private Long id;

	    @Column(unique = true, nullable = false)
	    private String token;  // Stores JWT tokens that have been revoked

	    // ✅ Default Constructor
	    public RevokedToken() {}

	    // ✅ Parameterized Constructor
	    public RevokedToken(String token) {
	        this.token = token;
	    }

	    // ✅ Getters & Setters
	    public Long getId() { return id; }
	    public void setId(Long id) { this.id = id; }

	    public String getToken() { return token; }
	    public void setToken(String token) { this.token = token; }
    
}
