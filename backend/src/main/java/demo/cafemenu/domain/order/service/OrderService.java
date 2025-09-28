package demo.cafemenu.domain.order.service;

import static demo.cafemenu.domain.order.entity.OrderStatus.PAID;
import static demo.cafemenu.domain.order.entity.OrderStatus.PENDING;
import static demo.cafemenu.global.exception.ErrorCode.PENDING_ORDERS_NOT_FOUND;
import static demo.cafemenu.global.exception.ErrorCode.USER_NOT_FOUND;

import demo.cafemenu.domain.order.dto.CheckoutRequest;
import demo.cafemenu.domain.order.dto.OrderDto;
import demo.cafemenu.domain.order.entity.Order;
import demo.cafemenu.domain.order.entity.OrderItem;
import demo.cafemenu.domain.order.repository.OrderItemRepository;
import demo.cafemenu.domain.order.repository.OrderRepository;
import demo.cafemenu.domain.product.entity.Product;
import demo.cafemenu.domain.product.repository.ProductRepository;
import demo.cafemenu.domain.user.entity.User;
import demo.cafemenu.domain.user.reposiitory.UserRepository;
import demo.cafemenu.global.exception.BusinessException;
import demo.cafemenu.global.exception.ErrorCode;
import jakarta.transaction.Transactional;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Transactional
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
                .findAllByUserAndStatus(user, PAID);
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

    /**
     * 사용자의 모든 PENDING 주문을 결제 처리.
     * - 날짜별로 이미 PAID가 있으면 아이템을 머지하고 PENDING은 삭제(UNIQUE 충돌 방지)
     * - 없으면 해당 PENDING을 그대로 PAID로 전환
     * - 배송지/우편번호는 다음 정책으로 반영:
     *   * PENDING → PAID 전환 시: 요청값으로 설정
     *   * 기존 PAID로 머지 시: PAID에 배송지가 없으면 설정, 이미 있으면 유지(간단 정책)
     */
    public void checkoutAllPending(Long userId, CheckoutRequest req) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new BusinessException(USER_NOT_FOUND));

        List<Order> pendings = orderRepository.findAllByUserAndStatus(user, PENDING);
        if (pendings.isEmpty()) {
            throw new BusinessException(PENDING_ORDERS_NOT_FOUND);
        }

        for (Order pending : pendings) {
            Optional<Order> paidOpt = orderRepository.findByUserAndStatusAndBatchDate(
                user, PAID, pending.getBatchDate());

            if (paidOpt.isPresent()) {
                Order paid = paidOpt.get();

                // 아이템 머지
                mergeItems(pending, paid);

                // 배송지: 기존 PAID에 주소가 없으면 이번 요청 값으로 세팅 (있으면 유지)
                if (paid.getShippingAddress() == null || paid.getShippingAddress().isBlank()) {
                    paid.updateShipping(req.shippingAddress(), req.shippingPostcode());
                }

                paid.recalcTotal();
                orderRepository.delete(pending); // UNIQUE(user,batch_date,status) 충돌 방지

            } else {
                // PENDING → PAID 전환
                pending.changeStatus(PAID);
                pending.updateShipping(req.shippingAddress(), req.shippingPostcode());
                pending.recalcTotal();
            }
        }
    }

    private void mergeItems(Order fromPending, Order toPaid) {
        fromPending.getItems().forEach(pi -> {
            OrderItem exist = toPaid.getItems().stream()
                .filter(x -> x.getProductId().equals(pi.getProductId()))
                .findFirst()
                .orElse(null);

            if (exist != null) {
                exist.addQuantity(pi.getQuantity());
            } else {
                OrderItem added = OrderItem.builder()
                    .order(toPaid)
                    .productId(pi.getProductId())
                    .unitPrice(pi.getUnitPrice())
                    .quantity(pi.getQuantity())
                    .build();
                toPaid.getItems().add(added);
            }
        });
    }

    // PENDING 주문 조회 (없으면 새로 생성)
    private Order getOrder(User user) {
        LocalDate today = LocalDate.now();

        Optional<Order> order = orderRepository.findByUserAndStatusAndBatchDate(user, PENDING, today);

        if (order.isPresent()) {
            return order.get();
        } else {
            Order newOrder = Order.builder()
                    .user(user)
                    .batchDate(today)
                    .status(PENDING)
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

}
