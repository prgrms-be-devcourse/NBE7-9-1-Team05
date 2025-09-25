package demo.cafemenu.domain.user.service;

import static demo.cafemenu.domain.user.entity.Role.ROLE_USER;

import demo.cafemenu.domain.user.dto.SignupRequest;
import demo.cafemenu.domain.user.dto.SignupResponse;
import demo.cafemenu.domain.user.entity.User;
import demo.cafemenu.domain.user.reposiitory.UserRepository;
import demo.cafemenu.global.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService {

  private final UserRepository userRepository;


  public SignupResponse signup(SignupRequest request) {

    // 중복 가입 확인(이메일)
    if (userRepository.existsByEmail(request.email())) {
      throw new BusinessException(ErrorCode.USER_EMAIL_DUPLICATE);
    }

    User user = User.builder()
        .email(request.email())
        .password(request.password()) // 추후 BCrypt.hashpw 를 사용하여 비밀번호 암호화 예정
        .name(request.name())
        .role(ROLE_USER)
        .build();
    userRepository.save(user);
    return new SignupResponse(user.getId(), user.getEmail(), user.getName());
  }
}
