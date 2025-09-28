package demo.cafemenu.domain.order.controller;

import demo.cafemenu.domain.order.dto.OrderDto;
import demo.cafemenu.domain.order.entity.Order;
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

    // 주문내역 조회
    @GetMapping("/order")
    public ResponseEntity<List<OrderDto>> getPaidOrder(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        Long userId = userDetails.getId();
        List<OrderDto> items = orderService.getPaidOrder(userId);
        return ResponseEntity.ok(items);
    }

    // 장바구니에 상품 추가
    @PostMapping("/item/{productId}")
    public ResponseEntity<Void> addItemToCart(@RequestParam Long userId, @PathVariable Long productId) {
        orderService.addOrderItem(userId, productId);
        return ResponseEntity.ok().build();
    }

    // 장바구니 조회
    @GetMapping("/order/cart")
    public List<OrderDto> getPendingOrdersByUser(@AuthenticationPrincipal UserDetailsImpl userDetails){
        Long userId = userDetails.getId();
        return orderService.getPendingOrdersByUser(userId);
    }

}

