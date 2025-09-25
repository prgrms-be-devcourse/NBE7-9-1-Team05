package demo.cafemenu.global.exception;


import static demo.cafemenu.global.exception.ErrorCode.INVALID_REQUEST;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
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

  // 유효성 검사 예외처리
  @ExceptionHandler(MethodArgumentNotValidException.class)
  @ResponseStatus(HttpStatus.BAD_REQUEST)
  public ErrorResponse handleMethodArgumentNotValidException(MethodArgumentNotValidException e) {
    log.error("Validation failed: {}", e.getMessage());

    // 첫 번째 유효성 검증 에러 메시지를 가져옴 (모든 에러 메시지로 반환할지 결정도 가능)
    String errorMessage = e.getBindingResult().getFieldError().getDefaultMessage();

    return new ErrorResponse(INVALID_REQUEST, errorMessage);
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<ErrorResponse> handleAllExceptions(Exception e) {
    log.error("Unexpected error: {}", e.getMessage(), e);
    return ResponseEntity
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .body(new ErrorResponse(ErrorCode.INTERNAL_SERVER_ERROR, "Internal server error"));
  }
}
