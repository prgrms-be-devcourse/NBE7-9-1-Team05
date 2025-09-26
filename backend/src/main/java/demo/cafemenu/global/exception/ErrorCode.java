package demo.cafemenu.global.exception;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
@AllArgsConstructor
public enum ErrorCode {

  // 400 BAD REQUEST (잘못된 요청)
  INVALID_REQUEST(HttpStatus.BAD_REQUEST, "잘못된 요청입니다"),
  DUPLICATE_EMAIL(HttpStatus.BAD_REQUEST, "이미 가입된 이메일입니다"),
  USER_ALREADY_EXISTS(HttpStatus.BAD_REQUEST, "이미 등록된 회원입니다."),

  // 401 UNAUTHORIZED (인증 실패)

  // 403 FORBIDDEN (접근 금지)

  // 404 NOT FOUND
  PAID_ORDERS_NOT_FOUND(HttpStatus.NOT_FOUND, "결제된 주문 내역이 없습니다."),

  // 500 INTERNAL SERVER ERROR (서버 내부 오류)
  INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "내부 서버 오류가 발생했습니다.");

  private final HttpStatus status;
  private final String description;
}
