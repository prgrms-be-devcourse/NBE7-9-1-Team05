package demo.cafemenu.domain.order.dto;

import demo.cafemenu.domain.order.entity.OrderStatus;
import lombok.Getter;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Getter
public class OrderDto {
    Long orderId;
    String email;
    LocalDate batchDate;
    Integer totalAmount;
    OrderStatus status;
    List<OrderItemDto> items = new ArrayList<>();

    public OrderDto(Long orderId, String email, LocalDate batchDate, Integer totalAmount, OrderStatus status) {
        this.orderId = orderId;
        this.email = email;
        this.batchDate = batchDate;
        this.totalAmount = totalAmount;
        this.status = status;
    }
}
