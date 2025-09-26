package demo.cafemenu.domain.order.controller;

import demo.cafemenu.domain.order.dto.OrderDto;
import demo.cafemenu.domain.order.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/user")
public class OrderController {

    private final OrderService orderService;

    /*
    추후 인증기반 조회로 변경 예정
    */
    @GetMapping("/{userId}/order")
    public ResponseEntity<List<OrderDto>> getPaidOrderByUserId(@PathVariable Long userId) {
        List<OrderDto> items = orderService.getPaidOrderByUserId(userId);
        return ResponseEntity.ok(items);
    }
}

