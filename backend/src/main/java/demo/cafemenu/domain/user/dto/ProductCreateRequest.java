package demo.cafemenu.domain.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

public record ProductCreateRequest(
    @NotBlank(message = "제품명은 필수 입력 항목입니다.")
    @Size(max = 120)
    String name,

    @NotNull(message = "제품 가격은 필수 입력 항목입니다.")
    @PositiveOrZero
    Integer price,

    @Size(max = 1000)
    String description
) {}
