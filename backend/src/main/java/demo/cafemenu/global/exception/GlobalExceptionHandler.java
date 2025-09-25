package demo.cafemenu.global.exception;


import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

  // 커스텀 예외처리
  @ExceptionHandler(BusinessException.class)
  public ResponseEntity<ErrorResponse> handleMeongnyangerangException(BusinessException e) {
    log.error("{} is occurred.", e.getErrorCode());

    return ResponseEntity
        .status(e.getHttpStatus())
        .body(new ErrorResponse(e.getErrorCode(), e.getMessage()));
  }

}
