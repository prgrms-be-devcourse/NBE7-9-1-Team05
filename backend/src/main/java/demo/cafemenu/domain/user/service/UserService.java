package demo.cafemenu.domain.user.service;

import static demo.cafemenu.domain.user.entity.Role.ROLE_USER;
import static demo.cafemenu.global.exception.ErrorCode.INVALID_CREDENTIALS;
import static demo.cafemenu.global.exception.ErrorCode.USER_ALREADY_EXISTS;
import static demo.cafemenu.global.exception.ErrorCode.USER_NOT_FOUND;

import demo.cafemenu.domain.user.dto.LoginRequest;
import demo.cafemenu.domain.user.dto.LoginResponse;
import demo.cafemenu.domain.user.dto.SignupRequest;
import demo.cafemenu.domain.user.dto.SignupResponse;
import demo.cafemenu.domain.user.entity.User;
import demo.cafemenu.domain.user.reposiitory.UserRepository;
import demo.cafemenu.global.exception.BusinessException;
import demo.cafemenu.global.jwt.JwtTokenProvider;
import demo.cafemenu.global.security.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService {

  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;
  private final AuthenticationManager authenticationManager;
  private final JwtTokenProvider jwtTokenProvider;

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

  public LoginResponse login(LoginRequest request) {
    try {
      // 1) 이메일/비번 인증
      Authentication authentication = authenticationManager.authenticate(
          new UsernamePasswordAuthenticationToken(request.email(), request.password())
      );

      // 2) 인증 성공 시 principal 꺼내기
      UserDetailsImpl principal = (UserDetailsImpl) authentication.getPrincipal();

      // 3) 추가 정보(name 등) 응답에 포함하려면 DB 조회
      User user = userRepository.findByEmail(principal.getEmail())
          .orElseThrow(() -> new BusinessException(USER_NOT_FOUND));

      // 4) 토큰 발급
      String token = jwtTokenProvider.createAccessToken(user);

      // 5) 응답
      return LoginResponse.of(token, principal.getRole().name(),
          principal.getId(), principal.getEmail(), user.getName());

    } catch (BadCredentialsException | UsernameNotFoundException e) {
      throw new BusinessException(INVALID_CREDENTIALS);
    }
  }
}
