package com.boot.demo.Controller;

import com.boot.demo.Exception.AnalyticsNotFoundException;
import com.boot.demo.Exception.InvalidReportDataException;
import com.boot.demo.Model.Analytics;
import com.boot.demo.Repository.AnalyticsRepository;
import com.boot.demo.Service.AnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = "*")
public class AnalyticsController {

    @Autowired
    private AnalyticsService analyticsService;
    
    @Autowired
    private AnalyticsRepository analyticsRepository;

    @PostMapping("/save")
    public ResponseEntity<?> saveOrUpdateReport(@RequestBody Map<String, Object> requestData) {
    	 // 🔹 Validate required fields
        if (!requestData.containsKey("reportType") || !requestData.containsKey("reportData")) {
            throw new InvalidReportDataException("❌ Missing 'reportType' or 'reportData'");
        }

        String reportType = (String) requestData.get("reportType");
        Object reportDataObj = requestData.get("reportData");

        // 🔹 Validate 'reportData' format
        if (!(reportDataObj instanceof List)) {
            throw new InvalidReportDataException("❌ 'reportData' must be a JSON Array.");
        }

        List<Map<String, Object>> reportData = (List<Map<String, Object>>) reportDataObj;

        // ✅ Fetch latest report of the same type (if exists)
        Optional<Analytics> existingReportOpt = analyticsRepository.findFirstByReportTypeOrderByGeneratedAtDesc(reportType);

        Analytics report;
        if (existingReportOpt.isPresent()) {
            // ✅ Update existing report
            report = existingReportOpt.get();
            report.setReportData(reportData);
            report.setGeneratedAt(LocalDateTime.now());
            analyticsRepository.save(report);
            return ResponseEntity.ok(Map.of("message", "✅ Report updated successfully!"));
        } else {
            // ✅ Create new report if none exists
            report = new Analytics();
            report.setReportType(reportType);
            report.setReportData(reportData);
            report.setGeneratedAt(LocalDateTime.now());
            analyticsRepository.save(report);
            return ResponseEntity.ok(Map.of("message", "✅ New report saved successfully!"));
        }
    }


    @GetMapping("/reports")
    public ResponseEntity<List<Analytics>> getAllReports() {
    	 List<Analytics> reports = analyticsRepository.findAll();

         if (reports.isEmpty()) {
             throw new AnalyticsNotFoundException("⚠️ No analytics reports found.");
         }

        return ResponseEntity.ok(reports); // ✅ Always returns JSON (even if empty)
    }

}
