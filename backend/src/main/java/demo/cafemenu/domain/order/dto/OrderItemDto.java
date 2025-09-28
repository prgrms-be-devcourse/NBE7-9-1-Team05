package demo.cafemenu.domain.order.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class OrderItemDto {
    private Long id;
    private Long productId;
    private String productName;
    private Integer unitPrice;
    private Integer quantity;
    private Integer lineAmount;
}
