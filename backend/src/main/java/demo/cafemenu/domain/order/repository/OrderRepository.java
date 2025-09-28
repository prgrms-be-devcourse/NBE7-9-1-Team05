package demo.cafemenu.domain.order.repository;

import demo.cafemenu.domain.order.entity.Order;
import demo.cafemenu.domain.order.entity.OrderStatus;
import demo.cafemenu.domain.user.entity.User;
import jakarta.persistence.Entity;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findAllByUserAndStatus(User user, OrderStatus status);

    Optional<Order> findByUserAndStatusAndBatchDate(User user, OrderStatus orderStatus, LocalDate today);
    List<Order> findByUserAndStatus(User user, OrderStatus status);


    List<Order> findByUserIdAndStatus(Long userId, OrderStatus orderStatus);
}
