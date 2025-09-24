package demo.cafemenu.web;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductForm {

  @NotBlank(message = "상품명은 필수입니다.")
  private String name;

  @NotNull(message = "가격은 필수입니다.")
  @PositiveOrZero(message = "가격은 0 이상이어야 합니다.")
  private Integer price;

  @Size(max = 1000, message = "설명은 1000자 이내여야 합니다.")
  private String description;
}
