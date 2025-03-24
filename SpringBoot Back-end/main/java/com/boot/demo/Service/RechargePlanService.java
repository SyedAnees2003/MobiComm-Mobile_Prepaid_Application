package com.boot.demo.Service;

import com.boot.demo.Model.RechargePlan;
import com.boot.demo.Repository.RechargePlanRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class RechargePlanService {

    @Autowired
    private RechargePlanRepository rechargePlanRepository;

    public List<RechargePlan> getAllPlans() {
        return rechargePlanRepository.findAll();
    }
    
    public List<Map<String, Object>> getCategoryWisePlanDetails() {
        return rechargePlanRepository.getCategoryWisePlanDetails();
    }

    public List<RechargePlan> getPlansByCategory(int categoryId) {
        return rechargePlanRepository.findByCategory_CategoryId(categoryId);
    }

    public Optional<RechargePlan> getPlanById(int planId) {
        return rechargePlanRepository.findById(planId);
    }

    public RechargePlan savePlan(RechargePlan plan) {
        return rechargePlanRepository.save(plan);
    }

    public void deletePlan(int planId) {
        rechargePlanRepository.deleteById(planId);
    }
}
