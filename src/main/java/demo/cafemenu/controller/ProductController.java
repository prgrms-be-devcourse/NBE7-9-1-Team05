package demo.cafemenu.controller;

import demo.cafemenu.web.ProductForm;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/products")
@RequiredArgsConstructor
public class ProductController {

  /** 등록 폼 화면 */
  @GetMapping("/new")
  public String createForm(@ModelAttribute("form") ProductForm form) {

    return "products/form"; // templates/products/form.html
  }
}
