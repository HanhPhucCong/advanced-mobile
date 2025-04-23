package org.agromarket.agro_server.service.admin;
import org.agromarket.agro_server.mapper.ProductMapper;
import org.agromarket.agro_server.model.entity.Category;
import org.agromarket.agro_server.repositories.admin.AdminCategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.agromarket.agro_server.model.dto.admin.CategoryDTO;
import org.agromarket.agro_server.mapper.CategoryMapper;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AdminCategoryService {
    private final AdminCategoryRepository categoryRepository;

    public AdminCategoryService(AdminCategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }


    public Category createCategory(Category category) {
        return categoryRepository.save(category);
    }

    public Category updateCategory(Long id, Category category) {
        Optional<Category> existingCategory = categoryRepository.findById(id);
        if (existingCategory.isPresent()) {
            Category updatedCategory = existingCategory.get();
            updatedCategory.setName(category.getName());
            return categoryRepository.save(updatedCategory);
        } else {
            throw new IllegalArgumentException("Category with ID " + id + " not found.");
        }
    }

    public void deleteCategory(Long id) {
        Category existingCategory = categoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Category with ID " + id + " not found."));
        existingCategory.setIsDeleted(true);
        existingCategory.setIsActive(false);
        categoryRepository.save(existingCategory);
    }

    public void restoreCategory(Long id) {
        Category deletedCategory = categoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Category with ID " + id + " not found."));
        if (Boolean.TRUE.equals(deletedCategory.getIsDeleted())) {
            deletedCategory.setIsDeleted(false);
            deletedCategory.setIsActive(true);
            categoryRepository.save(deletedCategory);
        } else {
            throw new IllegalStateException("Category with ID " + id + " is not deleted.");
        }
    }
    public List<CategoryDTO> getAllCategories() {
        return categoryRepository.findAll()
                .stream()
                .map(CategoryMapper::toCategoryDTO)
                .collect(Collectors.toList());
    }

    public List<CategoryDTO> getAllDeletedCategories() {
        return categoryRepository.findAllDeletedCategories()
                .stream()
                .map(CategoryMapper::toCategoryDTO)
                .collect(Collectors.toList());
    }
}
