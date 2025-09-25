package demo.cafemenu.domain.product.controller;

import demo.cafemenu.domain.product.service.ProductService;
import demo.cafemenu.web.ProductForm;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
@RequestMapping("/products")
@RequiredArgsConstructor
public class ProductController {

  private final ProductService productService;

  /** 등록 폼 화면 */
  @GetMapping("/new")
  public String createForm(@ModelAttribute("form") ProductForm form) {

    return "products/form"; // templates/products/form.html
  }

  /** 등록 처리 */
  @PostMapping
  public String create(@Valid @ModelAttribute("form") ProductForm form,
      BindingResult binding,
      RedirectAttributes ra) {

    // 검증 실패 → 다시 폼 화면으로 (에러 메시지를 템플릿에서 뿌림)
    if (binding.hasErrors()) {
      return "products/form";
    }

    // 서비스 호출로 제품 저장
    Long id = productService.create(form.getName(), form.getPrice(), form.getDescription());

    ra.addFlashAttribute("message", "상품이 등록되었습니다. (ID=" + id + ")");
    return "redirect:/products/new";

  }
}
