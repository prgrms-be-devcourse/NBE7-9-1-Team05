package demo.cafemenu.domain.order.controller;

import demo.cafemenu.domain.order.dto.OrderItemDto;
import demo.cafemenu.domain.order.service.OrderItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/user")
public class OrderItemController {

    private final OrderItemService orderItemService;

    /*
    userDetail 도입 시 변경 예정
    */
    @GetMapping("/{userId}/order/items")
    public ResponseEntity<List<OrderItemDto>> getOrderItemByUserId(@PathVariable Long userId) {
        List<OrderItemDto> items = orderItemService.getOrderItemByUserId(userId);
        return ResponseEntity.ok(items);
    }
}

