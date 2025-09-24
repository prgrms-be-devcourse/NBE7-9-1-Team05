package demo.cafemenu.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

public record ProductCreateRequest(

    @NotBlank(message = "제품명을 입력해 주세요.")
    String name,

    @NotNull(message = "가격을 입력해 주세요.")
    @PositiveOrZero(message = "가격은 0 이상이어야 합니다.")
    Integer price,

    @Size(max = 1000)
    String description
) {}
