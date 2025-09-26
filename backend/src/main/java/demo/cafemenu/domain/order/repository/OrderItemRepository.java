package demo.cafemenu.domain.order.repository;

import demo.cafemenu.domain.order.entity.OrderItem;
import demo.cafemenu.domain.order.entity.OrderStatus;
import demo.cafemenu.domain.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    List<OrderItem> findByOrder_UserAndOrder_Status(User user, OrderStatus orderStatus);
}
