package org.agromarket.agro_server.repositories.customer;

import java.time.LocalDateTime;
import java.util.List;
import org.agromarket.agro_server.common.OrderStatus;
import org.agromarket.agro_server.model.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

  @Modifying
  @Query(
      "UPDATE Order o SET o.status = 'CANCELED', o.isDeleted = true WHERE o.status = 'PENDING' "
          + "AND o.paymentMethod = 'WAITING' AND o.createdAt < :time")
  int markExpiredOrdersAsCanceled(@Param("time") LocalDateTime time);

  @Query(
      "SELECT o FROM Order  o WHERE o.paymentMethod = 'WAITING' "
          + "AND o.status = 'PENDING' AND o.user.id = :userId")
  List<Order> findPayByCardByUserIdAndStatusPending(long userId);

  @Query("SELECT o FROM Order o WHERE o.isDeleted = false")
  List<Order> getAllNotDeleted();

  List<Order> getByUserIdAndIsActiveTrueAndIsDeletedFalse(long userId);

  @Query("SELECT o FROM Order o WHERE o.status = 'CANCELED_REQUEST'")
  List<Order> getByStatusCanceledRequest();

  List<Order> findByStatusAndUpdatedAtBefore(OrderStatus status, LocalDateTime time);
}
