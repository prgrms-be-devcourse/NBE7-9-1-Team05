package demo.cafemenu.domain.order.controller;

import demo.cafemenu.domain.order.dto.OrderDto;
import demo.cafemenu.domain.order.service.OrderService;
import demo.cafemenu.global.security.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/user")
public class OrderController {

    private final OrderService orderService;

    @GetMapping("/order")
    public ResponseEntity<List<OrderDto>> getPaidOrderByUserId(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        Long userId = userDetails.getId();
        List<OrderDto> items = orderService.getPaidOrderByUserId(userId);
        return ResponseEntity.ok(items);
    }

    @PostMapping("/item/{productId}")
    public ResponseEntity<Void> addItemToCart(@RequestParam Long userId, @PathVariable Long productId) {
        orderService.addOrderItem(userId, productId);
        return ResponseEntity.ok().build();
    }
}

