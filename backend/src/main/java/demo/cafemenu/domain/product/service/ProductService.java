package demo.cafemenu.domain.product.service;

import demo.cafemenu.domain.product.entity.Product;
import demo.cafemenu.domain.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

    // 전체 상품 목록
    public List<Product> findAll(){
        return productRepository.findAll();
    }
}
