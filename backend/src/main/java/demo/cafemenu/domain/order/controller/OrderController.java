package demo.cafemenu.domain.order.controller;

import demo.cafemenu.domain.order.service.OrderService;
import org.springframework.web.bind.annotation.GetMapping;
import demo.cafemenu.domain.order.entity.Order;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class OrderController {

    private static OrderService orderService = null;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping("/api/user/orders?email={email}")
    public List<Order> getOrdersByStatusAndEmail(@RequestParam String email){
        return orderService.findByStatusAndUserEmail(email);
    }
}
