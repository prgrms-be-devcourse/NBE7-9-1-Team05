package demo.cafemenu.domain.product.controller;

import demo.cafemenu.domain.product.dto.ProductResponse;
import demo.cafemenu.domain.product.service.ProductService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping("/beans")
    public List<ProductResponse> getProduct() {
        return productService.getAll();
    }
}
