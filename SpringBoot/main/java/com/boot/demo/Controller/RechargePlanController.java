package com.boot.demo.Controller;

import com.boot.demo.Exception.CategoryNotFoundException;
import com.boot.demo.Exception.PlanNotFoundException;
import com.boot.demo.Model.Category;
import com.boot.demo.Model.RechargePlan;
import com.boot.demo.Repository.CategoryRepository;
import com.boot.demo.Repository.RechargePlanRepository;
import com.boot.demo.Service.RechargePlanService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/plans")
@CrossOrigin(origins = "*")
public class RechargePlanController {

    @Autowired
    private RechargePlanService rechargePlanService;

    @Autowired
    private CategoryRepository categoryRepository;  // ✅ Correctly Autowired
    
    @Autowired
    private RechargePlanRepository rechargePlanRepository;

    @GetMapping
    public ResponseEntity<List<RechargePlan>> getActivePlans() {
        List<RechargePlan> activePlans = rechargePlanRepository.findByStatus("active");
        return ResponseEntity.ok(activePlans);
    }
    
    @GetMapping("/inactive")
    public ResponseEntity<List<RechargePlan>> getInactivePlans() {
        List<RechargePlan> inactivePlans = rechargePlanRepository.findByStatus("inactive");
        return ResponseEntity.ok(inactivePlans);
    }
    
    @GetMapping("/planData")
    public ResponseEntity<List<Map<String, Object>>> getPlans() {
        List<RechargePlan> plans = rechargePlanService.getAllPlans();
        
        // ✅ Ensure each plan includes category details
        List<Map<String, Object>> response = plans.stream().map(plan -> {
            Map<String, Object> planData = new HashMap<>();
            planData.put("planId", plan.getPlanId());
            planData.put("planName", plan.getPlanName());
            planData.put("validityDays", plan.getValidityDays());
            planData.put("price", plan.getPrice());
            planData.put("sms", plan.getSms());
            
            // ✅ Include Category Details
            if (plan.getCategory() != null) {
                Map<String, Object> categoryData = new HashMap<>();
                categoryData.put("categoryId", plan.getCategory().getCategoryId());
                categoryData.put("categoryName", plan.getCategory().getCategoryName());
                planData.put("category", categoryData);
            } else {
                planData.put("category", null);
            }
            
            return planData;
        }).toList();

        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/category-wise-details")
    public ResponseEntity<List<Map<String, Object>>> getCategoryWisePlanDetails() {
        List<Map<String, Object>> categoryDetails = rechargePlanService.getCategoryWisePlanDetails();
        return ResponseEntity.ok(categoryDetails);
    }

    @GetMapping("/{categoryId}")
    public List<RechargePlan> getPlansByCategory(@PathVariable int categoryId) {
        return rechargePlanService.getPlansByCategory(categoryId);
    }

    // ✅ GET Plan by ID
    @GetMapping("/plan/{planId}")
    public ResponseEntity<RechargePlan> getPlanById(@PathVariable int planId) {
        RechargePlan plan = rechargePlanService.getPlanById(planId)
                .orElseThrow(() -> new PlanNotFoundException("❌ Plan with ID " + planId + " not found."));
        return ResponseEntity.ok(plan);
    }

    @PostMapping
    public ResponseEntity<?> createPlan(@RequestBody RechargePlan plan, @RequestHeader("Authorization") String token) {
    	try {
            Category category = categoryRepository.findById(plan.getCategory().getCategoryId())
                    .orElseThrow(() -> new CategoryNotFoundException("❌ Category not found."));

            plan.setCategory(category);
            RechargePlan savedPlan = rechargePlanService.savePlan(plan);
            return ResponseEntity.ok(savedPlan);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("⚠️ Error creating plan: " + e.getMessage());
        }
    }
    
 // ✅ PUT (Update Existing Plan)
    @PutMapping("/{planId}")
    public ResponseEntity<?> updatePlan(@PathVariable int planId, @RequestBody RechargePlan updatedPlan) {
        try {
        	RechargePlan planToUpdate = rechargePlanService.getPlanById(planId)
                    .orElseThrow(() -> new PlanNotFoundException("❌ Plan with ID " + planId + " not found."));

            // ✅ Update fields
            planToUpdate.setPlanName(updatedPlan.getPlanName());
            planToUpdate.setPrice(updatedPlan.getPrice());
            planToUpdate.setValidityDays(updatedPlan.getValidityDays());
            planToUpdate.setSms(updatedPlan.getSms());
            planToUpdate.setCalls(updatedPlan.getCalls());
            planToUpdate.setData(updatedPlan.getData());
            planToUpdate.setAdditionalBenefits(updatedPlan.getAdditionalBenefits());
            planToUpdate.setStatus(updatedPlan.getStatus());

            // ✅ Validate & Update Category
            Category category = categoryRepository.findById(updatedPlan.getCategory().getCategoryId())
                    .orElseThrow(() -> new CategoryNotFoundException("❌ Category not found."));
            planToUpdate.setCategory(category);
            
            // ✅ Save updated plan
            RechargePlan savedPlan = rechargePlanService.savePlan(planToUpdate);
            return ResponseEntity.ok(savedPlan);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("❌ Error updating plan: " + e.getMessage());
        }
    }


    @DeleteMapping("/{planId}")
    public ResponseEntity<?> deletePlan(@PathVariable int planId) {
    	 RechargePlan plan = rechargePlanService.getPlanById(planId)
                 .orElseThrow(() -> new PlanNotFoundException("❌ Plan with ID " + planId + " not found."));


        rechargePlanService.deletePlan(planId);
        return ResponseEntity.ok("✅ Recharge plan deleted successfully.");
    }
    
    @PutMapping("/{planId}/status")
    public ResponseEntity<?> updatePlanStatus(@PathVariable int planId) {
    	 RechargePlan plan = rechargePlanService.getPlanById(planId)
                 .orElseThrow(() -> new PlanNotFoundException("❌ Plan with ID " + planId + " not found."));

        plan.setStatus("inactive"); // ✅ Mark as inactive instead of deleting
        rechargePlanService.savePlan(plan);

        return ResponseEntity.ok("✅ Recharge plan marked as inactive.");
    }

}
