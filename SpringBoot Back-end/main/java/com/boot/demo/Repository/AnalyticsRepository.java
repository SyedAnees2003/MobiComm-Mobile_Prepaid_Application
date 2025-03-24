package com.boot.demo.Repository;

import com.boot.demo.Model.Analytics;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AnalyticsRepository extends JpaRepository<Analytics, Integer> {
    Optional<Analytics> findByReportType(String reportType);
    Optional<Analytics> findFirstByReportTypeOrderByGeneratedAtDesc(String reportType);
}
