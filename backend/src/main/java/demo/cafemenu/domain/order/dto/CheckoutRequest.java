package demo.cafemenu.domain.order.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CheckoutRequest(
    @NotBlank(message = "배송 주소는 필수입니다.")
    @Size(max = 200, message = "배송 주소는 200자 이하여야 합니다.")
    String shippingAddress,

    @NotBlank(message = "우편번호는 필수입니다.")
    @Pattern(regexp = "\\d{5}", message = "우편번호는 5자리 숫자여야 합니다.")
    String shippingPostcode
) {}
