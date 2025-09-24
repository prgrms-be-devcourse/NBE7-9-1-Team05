package demo.cafemenu.service;

import demo.cafemenu.domain.product.Product;
import demo.cafemenu.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductService {

  private final ProductRepository productRepository;

  public Long create(String name, Integer price, String description) {
    // 제품 중복이름 방지 - 추후 회의 통해 진행 예정
    return productRepository.save(Product.builder()
        .name(name)
        .price(price)
        .description(description)
        .build()).getId(); // 영속화 + ID 채번
  }

}
