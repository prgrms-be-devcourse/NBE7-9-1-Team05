package demo.cafemenu.domain.order.service;

import demo.cafemenu.domain.product.entity.Product;
import org.springframework.transaction.annotation.Transactional;
import demo.cafemenu.domain.order.dto.OrderDto;
import demo.cafemenu.domain.order.dto.OrderItemDto;
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
// import jakarta.transaction.Transactional;
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
    public List<OrderDto> getPaidOrder(Long userId) {
        User user = userRepository.findById(userId).get();

        List<Order> paidOrder = orderRepository
                .findAllByUserAndStatus(user, OrderStatus.PAID);
        if (paidOrder.isEmpty()) {
            throw new BusinessException(ErrorCode.PAID_ORDERS_NOT_FOUND);
        }
        return paidOrder.stream()
                .map(OrderDto::from)
                .toList();
    }

    /* 장바구니 상품 추가
    - 목록 있으면 수량만 추가, 없으면 생성
     */
    public void addOrderItem(Long userId, Long productId) {
        Order order = getOrder(userRepository.findById(userId).get());
        Product product = productRepository.findById(productId).get();
        OrderItem existOrderItem = findOrderItem(order, productId);

        if (existOrderItem != null) {
            existOrderItem.addQuantity(1);
        } else {
            OrderItem newOrderItem = createOrderItem(order, product);
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

    // 같은 상품 목록 조회
    private OrderItem findOrderItem(Order order, Long productId) {
        return order.getItems().stream()
                .filter(item -> item.getProductId().equals(productId))
                .findFirst()
                .orElse(null);
    }

    // 장바구니 내 상품 없을 시 상품 생성
    private OrderItem createOrderItem(Order order, Product product) {
        return OrderItem.builder()
                .order(order)
                .productId(product.getId())
                .unitPrice(product.getPrice())
                .quantity(1)
                .build();
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
