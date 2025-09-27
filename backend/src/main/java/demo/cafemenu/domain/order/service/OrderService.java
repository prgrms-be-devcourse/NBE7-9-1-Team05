package demo.cafemenu.domain.order.service;

import demo.cafemenu.domain.order.entity.OrderItem;
import demo.cafemenu.domain.order.entity.OrderStatus;
import demo.cafemenu.domain.order.repository.OrderItemRepository;
import demo.cafemenu.domain.user.reposiitory.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {
    private final OrderItemRepository orderItemRepository;
    private final UserRepository userRepository;

    public Long findIdByEmail(String email) {
        return userRepository.findIdByEmail(email);
        // email로 user id를 찾기
        // user id를 이용해서 order 목록 조회 -> items 조회
    }

    // status가 pending, id => order 조회
    // order의 items 조회
    public List<OrderItem> findItemByStatusAndUserId(Long id, OrderStatus status){
        return orderItemRepository.findItemByStatusAndUserId(id, status);
    }
}