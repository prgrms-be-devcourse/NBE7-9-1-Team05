package demo.cafemenu.domain.admin.controller;

import demo.cafemenu.domain.product.dto.ProductCreateRequest;
import demo.cafemenu.domain.product.dto.ProductResponse;
import demo.cafemenu.domain.product.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/beans")
public class AdminProductController {

  private final ProductService productService;

  // 제품 등록(admin)
  @PreAuthorize("hasAuthority('ROLE_ADMIN')")
  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public ProductResponse create(@Valid @RequestBody ProductCreateRequest req) {
    return productService.create(req);
  }

}
