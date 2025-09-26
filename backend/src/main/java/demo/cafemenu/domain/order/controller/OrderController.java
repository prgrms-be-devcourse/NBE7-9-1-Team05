package demo.cafemenu.domain.order.controller;

import demo.cafemenu.domain.order.entity.OrderItem;
import demo.cafemenu.domain.order.entity.OrderStatus;
import demo.cafemenu.domain.order.service.OrderService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

import static demo.cafemenu.domain.order.entity.OrderStatus.PENDING;

@RestController
public class OrderController {

    private OrderService orderService;

    @GetMapping("/api/customer/orders")
    public List<OrderItem> getCart(){
        return orderService.findByEmailAndPENDING(PENDING);
    }
}
