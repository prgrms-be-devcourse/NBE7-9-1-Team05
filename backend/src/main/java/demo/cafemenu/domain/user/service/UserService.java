package demo.cafemenu.domain.user.service;

import static demo.cafemenu.domain.user.entity.Role.ROLE_USER;
import static demo.cafemenu.global.exception.ErrorCode.USER_ALREADY_EXISTS;

import demo.cafemenu.domain.product.entity.Product;
import demo.cafemenu.domain.product.repository.ProductRepository;
import demo.cafemenu.domain.user.dto.SignupRequest;
import demo.cafemenu.domain.user.dto.SignupResponse;
import demo.cafemenu.domain.user.entity.User;
import demo.cafemenu.domain.user.reposiitory.UserRepository;
import demo.cafemenu.global.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService {

  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;

  public SignupResponse signup(SignupRequest request) {

    // 중복 가입 확인(이메일)
    if (userRepository.existsByEmail(request.email())) {
      throw new BusinessException(USER_ALREADY_EXISTS);
    }

    User user = User.builder()
        .email(request.email())
        .password(passwordEncoder.encode(request.password()))
        .name(request.name())
        .role(ROLE_USER)
        .build();

    userRepository.save(user);
    return new SignupResponse(user.getId(), user.getEmail(), user.getName());
  }
}
