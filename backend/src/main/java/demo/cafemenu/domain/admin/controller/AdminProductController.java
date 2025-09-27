package demo.cafemenu.domain.admin.controller;

import demo.cafemenu.domain.product.dto.ProductRequest;
import demo.cafemenu.domain.product.dto.ProductResponse;
import demo.cafemenu.domain.product.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
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
  public ProductResponse create(@Valid @RequestBody ProductRequest req) {
    return productService.create(req);
  }

  // 제품 수정(admin)
  @PreAuthorize("hasAuthority('ROLE_ADMIN')")
  @PutMapping("/{beanId}")
  @ResponseStatus(HttpStatus.OK)
  public ProductResponse update(@PathVariable Long beanId,
      @Valid @RequestBody ProductRequest req) {
    return productService.update(beanId, req);
  }
}
