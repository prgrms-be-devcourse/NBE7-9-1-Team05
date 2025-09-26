package demo.cafemenu.domain.order.repository;

import demo.cafemenu.domain.order.entity.OrderItem;
import org.junit.jupiter.api.Order;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
}
