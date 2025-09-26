package demo.cafemenu.domain.order.service;

import demo.cafemenu.domain.order.entity.OrderItem;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class OrdereService {

    private OrderRepository orderRepository;

    public Optional<OrderItem> findByEmail(String email) {
        return orderRepository.findByEmail(email);
    }
}