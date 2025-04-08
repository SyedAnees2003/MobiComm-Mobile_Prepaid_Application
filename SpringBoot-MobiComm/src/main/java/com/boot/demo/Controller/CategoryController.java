package com.boot.demo.Controller;

import com.boot.demo.Exception.CategoryNotFoundException;
import com.boot.demo.Model.Category;
import com.boot.demo.Model.RechargePlan;
import com.boot.demo.Repository.CategoryRepository;
import com.boot.demo.Repository.RechargePlanRepository;
import com.boot.demo.Service.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/categories")
@CrossOrigin(origins = "http://127.0.0.1:5500", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE})
public class CategoryController {

    @Autowired
    private CategoryService categoryService;
    
    @Autowired
    private CategoryRepository categoryRepository;
    
    @Autowired RechargePlanRepository rechargePlanRepository;
    
 // GET All Categories
    @GetMapping
    public ResponseEntity<List<Category>> getAllCategories() {
        List<Category> categories = categoryService.getAllCategories();
        return ResponseEntity.ok(categories);
    }

    // GET Category by ID
    @GetMapping("/{categoryId}")
    public ResponseEntity<Category> getCategoryById(@PathVariable int categoryId) {
    	Category category = categoryService.getCategoryById(categoryId)
                .orElseThrow(() -> new CategoryNotFoundException("❌ Category with ID " + categoryId + " not found."));
        return ResponseEntity.ok(category);
    }
    
 // POST (Create a New Category)
    @PostMapping
    public ResponseEntity<?> createCategory(@RequestBody Category category) {
        try {
            Category savedCategory = categoryService.saveCategory(category);
            return ResponseEntity.ok(savedCategory);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error creating category: " + e.getMessage());
        }
    }

    @DeleteMapping("/{categoryId}")
    public ResponseEntity<?> deleteCategory(@PathVariable int categoryId) {
    	 Category category = categoryRepository.findById(categoryId)
                 .orElseThrow(() -> new CategoryNotFoundException("❌ Category with ID " + categoryId + " not found."));

         // Set associated plans as inactive before deletion
         List<RechargePlan> plans = rechargePlanRepository.findByCategory_CategoryId(categoryId);
         for (RechargePlan plan : plans) {
             plan.setStatus("inactive");
             plan.setCategory(null);
             rechargePlanRepository.save(plan);
         }

        // Delete the category
        categoryRepository.deleteById(categoryId);

        return ResponseEntity.ok("Category deleted & plans set to inactive");
    }

}
