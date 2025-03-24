package com.boot.demo.Service;

import com.boot.demo.Model.Analytics;
import com.boot.demo.Repository.AnalyticsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class AnalyticsService {

	@Autowired
    private AnalyticsRepository analyticsRepository;

    // ✅ Save or Update report data
    public Analytics saveOrUpdateReport(String reportType, List<Map<String, Object>> reportData) {
        Optional<Analytics> existingReport = analyticsRepository.findFirstByReportTypeOrderByGeneratedAtDesc(reportType);

        Analytics analytics;
        if (existingReport.isPresent()) {
            analytics = existingReport.get();
            analytics.setReportData(reportData);  // ✅ Update existing report data
            analytics.setGeneratedAt(LocalDateTime.now()); // ✅ Update timestamp
        } else {
            analytics = new Analytics();
            analytics.setReportType(reportType);
            analytics.setReportData(reportData);
            analytics.setGeneratedAt(LocalDateTime.now());
        }

        return analyticsRepository.save(analytics);  // ✅ Either update or insert
    }
}
