package demo.cafemenu.domain.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record LoginRequest (

    @Email(message = "유효한 이메일 주소를 입력해 주세요.")
    @NotBlank(message = "이메일은 필수 입력 항목입니다.")
    String email,

    @Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\d)(?=.*[!@#$])[A-Za-z\\d!@#$]{8,}$",
    message = "비밀번호는 최소 8자 이상이며, 영문, 숫자, 특수문자(!,@,#,$)를 각각 하나 이상 포함해야 합니다.")
    @NotBlank(message = "비밀번호는 필수 입력 항목입니다.")
    String password

){}
