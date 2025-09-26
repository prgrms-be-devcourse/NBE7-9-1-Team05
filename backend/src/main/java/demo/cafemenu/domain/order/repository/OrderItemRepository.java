package demo.cafemenu.domain.order.repository;

import demo.cafemenu.domain.order.entity.OrderItem;
import demo.cafemenu.domain.order.entity.OrderStatus;

import java.util.List;

public interface OrderItemRepository {
    List<OrderItem> findByEmailAndPENDING(String email, OrderStatus status);
}
