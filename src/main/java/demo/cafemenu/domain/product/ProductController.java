package demo.cafemenu.domain.product;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.List;

@Controller("productMenuController")
public class ProductController {
    private final ProductService productService;

    public ProductController(ProductService productService){
        this.productService = productService;
    }

    // cafemenu.controller로 옮길 시, 해당 코드 옮기기
    // 전체 조회
    @GetMapping("/api/beans")
    @ResponseBody
    public List<Product> getProducts(){
        return productService.findAll();
    }
}