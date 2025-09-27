package demo.cafemenu.domain.product.service;

import static demo.cafemenu.global.exception.ErrorCode.DUPLICATE_PRODUCT_NAME;
import static demo.cafemenu.global.exception.ErrorCode.PRODUCT_NOT_FOUND;

import demo.cafemenu.domain.product.dto.ProductRequest;
import demo.cafemenu.domain.product.dto.ProductResponse;
import demo.cafemenu.domain.product.entity.Product;
import demo.cafemenu.domain.product.repository.ProductRepository;
import demo.cafemenu.global.exception.BusinessException;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductService {

    private final ProductRepository productRepository;

    // 전체 상품 목록
    public List<Product> findAll(){
        return productRepository.findAll();
    }

    // 제품 등록(관리자)
    public ProductResponse create(ProductRequest req) {
        if (productRepository.existsByName(req.name())) {
            throw new BusinessException(DUPLICATE_PRODUCT_NAME);
        }
      return toResponse(productRepository.save(Product.builder()
          .name(req.name())
          .price(req.price())
          .description(req.description())
          .build()));
    }

    // 제품 수정(관리자)
    public ProductResponse update(Long id, ProductRequest req) {
        Product product = productRepository.findById(id)
            .orElseThrow(() -> new BusinessException(PRODUCT_NOT_FOUND));

        if (productRepository.existsByNameAndIdNot(req.name(), id)) {
            throw new BusinessException(DUPLICATE_PRODUCT_NAME);
        }

        product.change(req.name(), req.price(), req.description()); // 영속 엔티티 변경 → dirty checking
        return toResponse(product);

    }

    private ProductResponse toResponse(Product p) {
        return new ProductResponse(p.getId(), p.getName(), p.getPrice(), p.getDescription());
    }
}
