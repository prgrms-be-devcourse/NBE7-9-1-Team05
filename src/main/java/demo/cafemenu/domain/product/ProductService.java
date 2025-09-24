package demo.cafemenu.domain.product;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductService {

    @PersistenceContext
    private EntityManager em;

    // cafemenu.service로 옮길 시, 해당 코드 옮기기
    public List<Product> findAll(){
        return em.createQuery("select p from Product p", Product.class)
                .getResultList();
    }

}
