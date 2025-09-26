package demo.cafemenu.domain.order.service;

import demo.cafemenu.domain.order.entity.OrderItem;
import demo.cafemenu.domain.order.entity.OrderStatus;
import demo.cafemenu.domain.order.repository.OrderItemRepository;
import demo.cafemenu.domain.order.repository.OrderRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import static demo.cafemenu.domain.order.entity.OrderStatus.PENDING;

@Service
public class OrderService {

    private OrderRepository orderRepository;
    private OrderItemRepository orderItemRepository;

    public List<OrderItem> findByEmailAndPENDING(String email, OrderStatus status) {
        return orderItemRepository.findByEmailAndPENDING(email, status);
    }
}