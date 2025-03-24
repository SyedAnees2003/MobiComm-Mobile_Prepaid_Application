package com.boot.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EntityScan(basePackages = "com.boot.demo.Model") // ✅ Ensure entity scanning
@EnableJpaRepositories(basePackages = "com.boot.demo.Repository") // ✅ Enable JPA repositories
public class SpringBootMobiCommApplication {

	public static void main(String[] args) {
		SpringApplication.run(SpringBootMobiCommApplication.class, args);
	}

}
