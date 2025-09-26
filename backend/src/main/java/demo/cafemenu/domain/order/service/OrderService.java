package demo.cafemenu.domain.order.service;

import demo.cafemenu.domain.order.entity.Order;
import demo.cafemenu.domain.order.entity.OrderStatus;
import demo.cafemenu.domain.order.repository.OrderRepository;
import org.springframework.stereotype.Service;

import java.util.List;

import static demo.cafemenu.domain.order.entity.OrderStatus.PENDING;

@Service
public class OrderService {
    private final OrderRepository orderRepository;

    public OrderService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    public List<Order> findByStatusAndUserEmail(String email) {
        return orderRepository.findByStatusAndUserEmail(PENDING, email);
    }
}