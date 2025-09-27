package demo.cafemenu.domain.product.controller;

import demo.cafemenu.domain.product.entity.Product;
import demo.cafemenu.domain.product.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
// @RequestMapping("/api/user")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping("/api/user/beans")
    public List<Product> getProduct(){
        return productService.findAll();
    }
}
