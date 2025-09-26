package demo.cafemenu.domain.order.service;

import demo.cafemenu.domain.order.dto.OrderItemDto;
import demo.cafemenu.domain.order.entity.OrderItem;
import demo.cafemenu.domain.order.entity.OrderStatus;
import demo.cafemenu.domain.order.repository.OrderItemRepository;
import demo.cafemenu.domain.order.repository.OrderRepository;
import demo.cafemenu.domain.product.repository.ProductRepository;
import demo.cafemenu.domain.user.entity.User;
import demo.cafemenu.domain.user.reposiitory.UserRepository;
import demo.cafemenu.global.exception.BusinessException;
import demo.cafemenu.global.exception.ErrorCode;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderItemService {

    private final OrderItemRepository orderItemRepository;
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    /* 주문 내역 조회
    - userId 기준으로 주문 목록 가져오기(userDetail 도입 시 변경 예정)
    - PAID 상태만
     */
    @Transactional
    public List<OrderItemDto> getOrderItemByUserId(Long userId) {
        User user = userRepository.findById(userId).get();

        List<OrderItem> paidItems = orderItemRepository
                .findByOrder_UserAndOrder_Status(user, OrderStatus.PAID);
        if (paidItems.isEmpty()) {
            throw new BusinessException(ErrorCode.PAID_ORDERS_NOT_FOUND);
        }

        return paidItems.stream()
                .map(item -> new OrderItemDto(
                        item.getProductId(),
                        item.getQuantity(),
                        item.getLineAmount(),
                        item.getOrder().getBatchDate()
                ))
                .toList();
    }
}
