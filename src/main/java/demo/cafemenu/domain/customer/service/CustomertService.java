package demo.cafemenu.domain.customer.service;

import demo.cafemenu.domain.product.repository.ProductRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service("productMenuServ")
public class CustomertService {

    private final ProductRepository productRepository;

    public CustomertService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    // cafemenu.service로 옮길 시, 해당 코드 옮기기
    public List<Product> findAll(){
        return productRepository.findAll();
    }
}
