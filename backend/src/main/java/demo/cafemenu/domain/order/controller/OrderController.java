package demo.cafemenu.domain.order.controller;

import demo.cafemenu.domain.order.entity.OrderItem;
import demo.cafemenu.domain.order.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class OrderController {
    private final OrderService orderService;


    @GetMapping("/api/user/orders?email={email}") // 여기 static resource가 없다?
    public List<OrderItem> getOrdersByStatusAndEmail(@RequestParam String email){
        Long id = orderService.findIdByEmail(email); // user id를 찾는다. -> id로 order의 items 조회
    }
}
