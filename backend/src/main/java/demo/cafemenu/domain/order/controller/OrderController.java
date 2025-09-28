package demo.cafemenu.domain.order.controller;

import demo.cafemenu.domain.order.dto.CheckoutRequest;
import demo.cafemenu.domain.order.dto.OrderDto;
import demo.cafemenu.domain.order.service.OrderService;
import demo.cafemenu.global.security.*;
import demo.cafemenu.global.security.UserDetailsImpl;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

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
    public ResponseEntity<Void> addItemToCart(@AuthenticationPrincipal UserDetailsImpl userDetails, @PathVariable Long productId) {
        Long userId = userDetails.getId();
        orderService.addOrderItem(userId, productId);
        return ResponseEntity.ok().build();
    }

    // 사용자의 모든 PENDING 주문을 결제 처리
    @PostMapping("/orders/checkout")
    @ResponseStatus(HttpStatus.OK)
    public void checkoutAll(@AuthenticationPrincipal UserDetailsImpl principal,
        @Valid @RequestBody CheckoutRequest request) {
        orderService.checkoutAllPending(principal.getId(), request);
    }
}

