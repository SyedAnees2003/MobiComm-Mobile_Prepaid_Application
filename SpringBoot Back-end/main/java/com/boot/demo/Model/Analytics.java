package com.boot.demo.Model;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Entity
@Table(name = "analytics")
public class Analytics {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int reportId;

    @Column(nullable = false)
    private String reportType;

    @JdbcTypeCode(SqlTypes.JSON)
    @Convert(converter = JsonConverter.class)  // ✅ Use JSON Converter for List<Map>
    private List<Map<String, Object>> reportData;

    @Column(name = "generated_at", columnDefinition = "DATETIME DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime generatedAt;

    // ✅ Getters and Setters
    public int getReportId() { return reportId; }
    public void setReportId(int reportId) { this.reportId = reportId; }

    public String getReportType() { return reportType; }
    public void setReportType(String reportType) { this.reportType = reportType; }

    public List<Map<String, Object>> getReportData() { return reportData; }
    public void setReportData(List<Map<String, Object>> reportData) { this.reportData = reportData; }

    public LocalDateTime getGeneratedAt() { return generatedAt; }
    public void setGeneratedAt(LocalDateTime generatedAt) { this.generatedAt = generatedAt; }
}