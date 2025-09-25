package demo.cafemenu.global.exception;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
@AllArgsConstructor
public enum ErrorCode {

  // 400 BAD REQUEST (잘못된 요청)

  // 401 UNAUTHORIZED (인증 실패)

  // 403 FORBIDDEN (접근 금지)

  // 404 NOT FOUND

  // 500 INTERNAL SERVER ERROR (서버 내부 오류)

  private final HttpStatus status;
  private final String description;
}
