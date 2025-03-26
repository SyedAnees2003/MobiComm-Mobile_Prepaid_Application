package com.boot.demo.Repository;

import com.boot.demo.Model.RechargePlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Map;

@Repository
public interface RechargePlanRepository extends JpaRepository<RechargePlan, Integer> {
	List<RechargePlan> findByCategory_CategoryId(int categoryId);
	
    List<RechargePlan> findByStatus(String status); // ✅ Fetch only active plans
	
	 @Query("SELECT new map(c.categoryName as categoryName, COUNT(DISTINCT p.planId) as totalPlans, " +
	           "COUNT(r.rechargeId) as activeSubscribers, SUM(p.price) as revenueGenerated) " +
	           "FROM RechargePlan p " +
	           "JOIN p.category c " +
	           "LEFT JOIN p.rechargeHistoryList r " + 
	           "GROUP BY c.categoryName")
	    List<Map<String, Object>> getCategoryWisePlanDetails();
}
