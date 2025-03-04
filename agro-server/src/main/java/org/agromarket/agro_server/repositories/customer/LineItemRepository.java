package org.agromarket.agro_server.repositories.customer;

import java.time.LocalDateTime;
import java.util.List;
import org.agromarket.agro_server.model.entity.LineItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface LineItemRepository extends JpaRepository<LineItem, Long> {
  @Transactional
  @Modifying
  @Query("DELETE FROM LineItem li WHERE li.cart.id = :cartId")
  void deleteAllByCartId(@Param("cartId") long cartId);

  @Query("SELECT l FROM LineItem l WHERE l.id = :id AND l.isActive=true AND l.isDeleted=false")
  LineItem findByIdAndIsActiveTrueAndIsDeletedFalse(long id);

  @Modifying
  @Query(
      "UPDATE LineItem l SET l.order = null WHERE l.order.id IN (SELECT o.id FROM Order o WHERE o.status = 'PENDING' AND o.createdAt < :time)")
  int removeOrderFromLineItems(@Param("time") LocalDateTime time);

  @Query(
      "SELECT l FROM LineItem l WHERE l.order.id IN "
          + "(SELECT o.id FROM Order o WHERE o.status = 'PENDING' AND o.paymentMethod = 'WAITING' "
          + "AND o.createdAt < :time)")
  List<LineItem> findExpiredLineItems(@Param("time") LocalDateTime time);
}
