package org.agromarket.agro_server.service.admin;

import jakarta.persistence.EntityNotFoundException;
import org.agromarket.agro_server.model.dto.admin.ProductCreateDTO;
import org.agromarket.agro_server.model.dto.admin.ProductDTO;
import org.agromarket.agro_server.mapper.ProductMapper;
import org.agromarket.agro_server.model.entity.Category;
import org.agromarket.agro_server.model.entity.Product;
import org.agromarket.agro_server.model.entity.ProductImage;
import org.agromarket.agro_server.repositories.admin.AdminCategoryRepository;
import org.agromarket.agro_server.repositories.admin.AdminProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminProductService {

    private final AdminProductRepository productRepository;
    private final AdminCategoryRepository categoryRepository;

    @Autowired
    public AdminProductService(AdminProductRepository productRepository, AdminCategoryRepository categoryRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
    }

    public List<ProductDTO> getAllProducts() {
        return productRepository.findAll()
                .stream()
                .map(ProductMapper::toProductDTO)
                .collect(Collectors.toList());
    }

    public ProductDTO getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found with id: " + id));
        return ProductMapper.toProductDTO(product);
    }

    public Product createProduct(ProductCreateDTO dto) {
        Category cat = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new EntityNotFoundException("Category not found"));

        Product p = new Product();
        p.setName(dto.getName());
        p.setDescription(dto.getDescription());
        p.setPrice(dto.getPrice());
        p.setQuantity(dto.getQuantity());
        p.setUnit(dto.getUnit());
        p.setCategory(cat);

        // xử lý images
        if (dto.getImageUrls() != null) {
            dto.getImageUrls().forEach(url -> {
                ProductImage img = new ProductImage();
                img.setUrl(url);
                p.addImage(img);
            });
        }

        return productRepository.save(p);
    }

    public Product updateProduct(Long id, ProductCreateDTO product) {
        Product existingProduct = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found with id: " + id));

        existingProduct.setName(product.getName());
        existingProduct.setDescription(product.getDescription());
        existingProduct.setPrice(product.getPrice());
        existingProduct.setQuantity(product.getQuantity());
        existingProduct.setUnit(product.getUnit());

        Category cat = categoryRepository.findById(product.getCategoryId())
                .orElseThrow(() -> new EntityNotFoundException("Category not found"));

        existingProduct.setCategory(cat);
        if (product.getImageUrls() != null) {
            product.getImageUrls().forEach(url -> {
                ProductImage img = new ProductImage();
                img.setUrl(url);
                existingProduct.addImage(img);
            });
        }
        return productRepository.save(existingProduct);
    }
    public void restoreProduct(Long id) {
        Product restoreProduct = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found with id: " + id));
        if (Boolean.TRUE.equals(restoreProduct.getIsDeleted())) {
            restoreProduct.setIsDeleted(false);
            restoreProduct.setIsActive(true);
            productRepository.save(restoreProduct);
        } else {
            throw new IllegalStateException("Product with ID " + id + " is not deleted.");
        }
    }
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found with id: " + id));
        product.setIsDeleted(true);
        product.setIsActive(false);
        productRepository.save(product);
    }
    public Product addProductQuantity(Long id, int addedQuantity) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found with id: " + id));
        if (addedQuantity <= 0) {
            throw new IllegalArgumentException("Added quantity must be greater than 0.");
        }
        product.setQuantity(product.getQuantity() + addedQuantity);
        return productRepository.save(product);
    }
}
