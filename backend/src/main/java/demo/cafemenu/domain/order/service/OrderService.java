package demo.cafemenu.domain.order.service;

import demo.cafemenu.domain.product.entity.Product;
import org.springframework.transaction.annotation.Transactional;
import demo.cafemenu.domain.order.dto.OrderDto;
import demo.cafemenu.domain.order.dto.OrderItemDto;
import demo.cafemenu.domain.order.entity.Order;
import demo.cafemenu.domain.order.entity.OrderStatus;
import demo.cafemenu.domain.order.repository.OrderItemRepository;
import demo.cafemenu.domain.order.repository.OrderRepository;
import demo.cafemenu.domain.product.repository.ProductRepository;
import demo.cafemenu.domain.user.entity.User;
import demo.cafemenu.domain.user.reposiitory.UserRepository;
import demo.cafemenu.global.exception.BusinessException;
import demo.cafemenu.global.exception.ErrorCode;
// import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderItemRepository orderItemRepository;
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    /* 주문 내역 조회
    - status가 PAID인 것만
     */
    @Transactional
    public List<OrderDto> getPaidOrderByUserId(Long userId) {
        User user = userRepository.findById(userId).get();

        List<Order> paidOrder = orderRepository
                .findByUserAndStatus(user, OrderStatus.PAID);
        if (paidOrder.isEmpty()) {
            throw new BusinessException(ErrorCode.PAID_ORDERS_NOT_FOUND);
        }

        return paidOrder.stream()
                .map(item -> new OrderDto(
                        item.getId(),
                        item.getUser().getEmail(),
                        item.getBatchDate(),
                        item.getTotalAmount(),
                        item.getStatus()
                ))
                .toList();
    }

    // 장바구니(status = PENDING, 특정 Id로 조회)조회
    @Transactional(readOnly = true)
    public List<OrderDto> getPendingOrdersByUser(Long userId) {
        List<Order> orders = orderRepository.findByUserIdAndStatus(userId, OrderStatus.PENDING);

        return orders.stream()
                .map(order -> {
                    // DTO 생성
                    OrderDto dto = new OrderDto(
                            order.getId(),
                            order.getUser().getEmail(),
                            order.getBatchDate(),
                            order.getTotalAmount(),
                            order.getStatus()
                    );

                    List<OrderItemDto> itemDtos = order.getItems().stream()
                            .map(item -> {
                                String productName = productRepository.findById(item.getProductId())
                                        .map(Product::getName)
                                        .orElse("Unknown Product");

                                return new OrderItemDto(
                                        item.getId(),
                                        item.getProductId(),
                                        productName,
                                        item.getUnitPrice(),
                                        item.getQuantity(),
                                        item.getLineAmount()
                                );
                            })
                            .toList();

                    dto.getItems().addAll(itemDtos);

                    return dto;
                })
                .toList();
    }
}
