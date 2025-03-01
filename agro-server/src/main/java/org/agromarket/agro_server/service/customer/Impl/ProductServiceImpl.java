package org.agromarket.agro_server.service.customer.Impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.agromarket.agro_server.model.dto.request.ProductRequest;
import org.agromarket.agro_server.model.dto.response.ProductResponse;
import org.agromarket.agro_server.model.entity.Category;
import org.agromarket.agro_server.model.entity.Product;
import org.agromarket.agro_server.repositories.customer.CategoryRepository;
import org.agromarket.agro_server.repositories.customer.ProductRepository;
import org.agromarket.agro_server.service.customer.ProductService;
import org.agromarket.agro_server.util.mapper.ProductMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductServiceImpl implements ProductService {

  private final ProductRepository productRepository;
  private final ProductMapper productMapper;
  private final CategoryRepository categoryRepository;
  @Transactional
  @Override
  public ProductResponse create(ProductRequest productRequest) {
    Product product = productMapper.convertToEntity(productRequest);
    return productMapper.convertToReponse(productRepository.save(product));
  }

  @Override
  public Page<ProductResponse> getAllActive(Pageable pageable) {
    Page<Product> products = productRepository.getAllByIsActiveTrueAndIsDeletedFalse(pageable);
    return products.map(productMapper::convertToReponse);
  }
  @Override
  public Page<ProductResponse> getProductByCategory(Long categoryId, Pageable pageable) {
    Category category = categoryRepository.findById(categoryId)
            .orElseThrow(() -> new IllegalArgumentException("Category not found with id: " + categoryId));

    Page<Product> products = productRepository.getProductsByCategory(category, pageable);

    return products.map(productMapper::convertToReponse);
  }
  @Override
  public Page<ProductResponse> getRandomProduct(Pageable pageable) {
    List<Product> products = productRepository.findAllByIsActiveTrueAndIsDeletedFalse();
    Collections.shuffle(products);
    List<Product> randomProducts = products.stream()
            .limit(10)
            .toList();
    List<ProductResponse> productResponses = randomProducts.stream()
            .map(productMapper::convertToReponse)
            .toList();
    return new PageImpl<>(productResponses, pageable, productResponses.size());
  }
  @Override
  public Page<ProductResponse> searchProductsByName(String name, Pageable pageable) {
    Page<Product> products = productRepository.searchProductsByName(name, pageable);
    return products.map(productMapper::convertToReponse);
  }

}
