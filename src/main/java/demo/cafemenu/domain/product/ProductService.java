package demo.cafemenu.domain.product;

import demo.cafemenu.repository.ProductRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Service;

import java.util.List;

@Service("productMenuService")
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    // cafemenu.service로 옮길 시, 해당 코드 옮기기
    public List<Product> findAll(){
        return productRepository.findAll();
    }

}
