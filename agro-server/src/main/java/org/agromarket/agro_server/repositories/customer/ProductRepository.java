package org.agromarket.agro_server.repositories.customer;

import org.agromarket.agro_server.model.entity.Category;
import org.agromarket.agro_server.model.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

  Page<Product> getAllByIsActiveTrueAndIsDeletedFalse(Pageable pageable);
  Page<Product> getProductsByCategory(Category category, Pageable pageable);
  List<Product> findAllByIsActiveTrueAndIsDeletedFalse();
  @Query("SELECT p FROM Product p WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', :name, '%')) AND p.isActive = true AND p.isDeleted = false")
  Page<Product> searchProductsByName(@Param("name") String name, Pageable pageable);

  @Query("SELECT p FROM Product p WHERE p.id =:productId AND p.isActive=true AND p.isDeleted=false")
  Product getActiveProductById(@Param("productId") Long productId);

  @Modifying
  @Query(
      "UPDATE Product p SET p.quantity = p.quantity - :quantity WHERE p.id = :productId "
          + "AND p.isActive = true AND p.isDeleted = false AND p.quantity >= :quantity")
  int decreaseProductQuantity(@Param("productId") long productId, @Param("quantity") int quantity);

  @Modifying
  @Query(
      "UPDATE Product p SET p.quantity = p.quantity + :quantity WHERE p.id = :productId "
          + "AND p.isActive = true AND p.isDeleted = false")
  int increaseProductQuantity(@Param("productId") long productId, @Param("quantity") int quantity);

  @Modifying
  @Query("UPDATE Product p SET p.quantity = p.quantity + :quantity WHERE p.id = :productId")
  void restoreStock(@Param("productId") Long productId, @Param("quantity") int quantity);
}
