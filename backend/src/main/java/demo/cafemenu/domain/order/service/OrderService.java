package demo.cafemenu.domain.order.service;

import demo.cafemenu.domain.order.dto.OrderDto;
import demo.cafemenu.domain.order.dto.OrderItemRequestDto;
import demo.cafemenu.domain.order.entity.Order;
import demo.cafemenu.domain.order.entity.OrderItem;
import demo.cafemenu.domain.order.entity.OrderStatus;
import demo.cafemenu.domain.order.repository.OrderItemRepository;
import demo.cafemenu.domain.order.repository.OrderRepository;
import demo.cafemenu.domain.product.entity.Product;
import demo.cafemenu.domain.product.repository.ProductRepository;
import demo.cafemenu.domain.user.entity.User;
import demo.cafemenu.domain.user.reposiitory.UserRepository;
import demo.cafemenu.global.exception.BusinessException;
import demo.cafemenu.global.exception.ErrorCode;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

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

    @Transactional
    public void addOrderItem(Long userId, OrderItemRequestDto request) {
        Order order = getOrder(userRepository.findById(userId).get());
        Product product = productRepository.findById(request.getProductId()).get();
        OrderItem existOrderItem = order.getItems().stream()
                .filter(item -> item.getProductId().equals(request.getProductId()))
                .findFirst()
                .orElse(null);

        // 상품 목록 존재하면 수량 +1
        if (existOrderItem != null) {
            existOrderItem.addQuantity(1);
        } else { // 존재하지 않으면 새로 생성
            OrderItem newOrderItem = OrderItem.builder()
                    .order(order)
                    .productId(request.getProductId())
                    .unitPrice(product.getPrice())
                    .quantity(1)
                    .build();
            order.getItems().add(newOrderItem);
        }
        order.recalcTotal();
        orderRepository.save(order);
    }

    // PENDING 주문 조회 (없으면 새로 생성)
    private Order getOrder(User user) {
        LocalDate today = LocalDate.now();
        Optional<Order> order = orderRepository.findByUserAndStatusAndBatchDate(user, OrderStatus.PENDING, today);

        if (order.isPresent()) {
            return order.get();
        } else {
            Order newOrder = Order.builder()
                    .user(user)
                    .batchDate(today)
                    .status(OrderStatus.PENDING)
                    .build();
            return orderRepository.save(newOrder);
        }
    }
}
