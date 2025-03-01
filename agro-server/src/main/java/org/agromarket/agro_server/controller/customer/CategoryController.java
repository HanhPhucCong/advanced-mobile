package org.agromarket.agro_server.controller.customer;

import org.agromarket.agro_server.model.dto.admin.CategoryDTO;
import org.agromarket.agro_server.service.admin.AdminCategoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {
    private final AdminCategoryService categoryService;

    public CategoryController(AdminCategoryService categoryService) {
        this.categoryService = categoryService;
    }
    @GetMapping
    public ResponseEntity<List<CategoryDTO>> getAllCategories() {
        return ResponseEntity.ok(categoryService.getAllCategories());
    }
}
