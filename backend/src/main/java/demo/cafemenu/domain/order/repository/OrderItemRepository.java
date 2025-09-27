package demo.cafemenu.domain.order.repository;

import demo.cafemenu.domain.order.entity.OrderItem;
import demo.cafemenu.domain.order.entity.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long>{
    List<OrderItem> findItemsByStatusAndId(OrderStatus status, Long id);
}
