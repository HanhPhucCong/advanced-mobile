package org.agromarket.agro_server.config.shceduler;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.agromarket.agro_server.common.OrderStatus;
import org.agromarket.agro_server.model.entity.LineItem;
import org.agromarket.agro_server.model.entity.Order;
import org.agromarket.agro_server.repositories.customer.LineItemRepository;
import org.agromarket.agro_server.repositories.customer.OrderRepository;
import org.agromarket.agro_server.service.customer.OrderService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.transaction.annotation.Transactional;

@Configuration
@Slf4j
@EnableScheduling
@RequiredArgsConstructor
public class SchedulerConfig {

  private final OrderRepository orderRepository;
  private final LineItemRepository lineItemRepository;
  private final OrderService orderService;

  @Bean
  public ScheduledExecutorService scheduledExecutorService() {
    return Executors.newScheduledThreadPool(5);
  }

  @Transactional
  @Scheduled(fixedRate = 60000) // chay moi 1 phut
  public void checkPaymentStatus() {
    LocalDateTime minutesAgo = LocalDateTime.now().minusMinutes(5);

    // lineItems de restock (pending & waiting > 5p)
    List<LineItem> expiredLineItems = lineItemRepository.findExpiredLineItems(minutesAgo);
    if (!expiredLineItems.isEmpty()) {
      orderService.restock(expiredLineItems);
    }

    // cancel expired Orders (pending & waiting > 5p)
    int updatedOrders = orderRepository.markExpiredOrdersAsCanceled(minutesAgo);

    log.info(
        "Canceled {} expired orders and restored stock for {} line items",
        updatedOrders,
        expiredLineItems.size());
  }

  @Transactional
  @Scheduled(fixedRate = 60000) // chay moi 1 phut
  public void updateOrderStatus() {
    LocalDateTime thirtyMinutesAgo = LocalDateTime.now().minusMinutes(30);

    // tim orders can duoc cap nhat status
    List<Order> ordersToProcessing =
        orderRepository.findByStatusAndUpdatedAtBefore(OrderStatus.CONFIRMED, thirtyMinutesAgo);
    List<Order> ordersToShipping =
        orderRepository.findByStatusAndUpdatedAtBefore(OrderStatus.PROCESSING, thirtyMinutesAgo);
    List<Order> ordersToDelivered =
        orderRepository.findByStatusAndUpdatedAtBefore(OrderStatus.SHIPPING, thirtyMinutesAgo);

    List<Order> ordersToSave = new ArrayList<>();

    // update status
    ordersToProcessing.forEach(
        order -> {
          order.setStatus(OrderStatus.PROCESSING);
          log.info("Order {} changed to PROCESSING", order.getId());
          ordersToSave.add(order);
        });

    ordersToShipping.forEach(
        order -> {
          order.setStatus(OrderStatus.SHIPPING);
          log.info("Order {} changed to SHIPPING", order.getId());
          ordersToSave.add(order);
        });

    ordersToDelivered.forEach(
        order -> {
          order.setStatus(OrderStatus.DELIVERED);
          log.info("Order {} changed to DELIVERED", order.getId());
          ordersToSave.add(order);
        });

    if (!ordersToSave.isEmpty()) {
      orderRepository.saveAll(ordersToSave);
    }
  }
}
