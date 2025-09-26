package demo.cafemenu.domain.order.repository;

import org.junit.jupiter.api.Order;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderRepository extends JpaRepository<Order, Long> {

}
