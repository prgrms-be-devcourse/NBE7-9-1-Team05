package demo.cafemenu.domain.product.controller;

import demo.cafemenu.domain.product.entity.Product;
import demo.cafemenu.domain.product.service.ProductService;
import org.antlr.v4.runtime.tree.pattern.ParseTreePattern;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping("/customer/beans")
    public List<Product> getProduct(){
        return productService.findAll();
    }
}
