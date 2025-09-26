package demo.cafemenu.domain.user.controller;

import demo.cafemenu.domain.user.dto.LoginRequest;
import demo.cafemenu.domain.user.dto.LoginResponse;
import demo.cafemenu.domain.user.dto.SignupRequest;
import demo.cafemenu.domain.user.dto.SignupResponse;
import demo.cafemenu.domain.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/user")
public class UserController {

  private final UserService userService;

  // 사용자 회원가입 API
  @PostMapping("/signup")
  @ResponseStatus(HttpStatus.CREATED)
  public SignupResponse signup(@Validated @RequestBody SignupRequest request) {
    return userService.signup(request);
  }

  // 로그인 API (User/Admin 공용)
  @PostMapping("/login")
  @ResponseStatus(HttpStatus.OK)
  public LoginResponse login(@Valid @RequestBody LoginRequest request) {
    return userService.login(request);
  }

}