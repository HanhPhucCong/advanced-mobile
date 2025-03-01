package org.agromarket.agro_server.service.customer;

import org.agromarket.agro_server.model.dto.request.ProductRequest;
import org.agromarket.agro_server.model.dto.response.ProductResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ProductService {

  public ProductResponse create(ProductRequest productRequest);

  public Page<ProductResponse> getAllActive(Pageable pageable);

  Page<ProductResponse> getProductByCategory(Long categoryId, Pageable pageable);
  public Page<ProductResponse> getRandomProduct(Pageable pageable);
  public Page<ProductResponse> searchProductsByName(String name, Pageable pageable);
}