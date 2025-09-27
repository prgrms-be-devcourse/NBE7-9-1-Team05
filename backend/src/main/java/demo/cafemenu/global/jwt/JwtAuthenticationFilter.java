package demo.cafemenu.global.jwt;

import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

  private final JwtTokenProvider tokenProvider;

  @Override
  protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
      throws ServletException, IOException {

    // 토큰 추출
    String token = resolveToken(req);
    if (token != null) {
      try {
        // 토큰 유효성 검사
        tokenProvider.validateToken(token);
        // 사용자 인증 정보 생성
        Authentication auth = tokenProvider.getAuthentication(token);
        // 사용자 정보를 SecurityContext에 저장
        SecurityContextHolder.getContext().setAuthentication(auth);
      } catch (JwtException e) {
        // 잘못된/만료 토큰 → 401
        SecurityContextHolder.clearContext();
        res.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid or expired token");
        return;
      }
    }
    chain.doFilter(req, res);
  }

  private String resolveToken(HttpServletRequest req) {
    String bearer = req.getHeader("Authorization");
    if (StringUtils.hasText(bearer) && bearer.startsWith("Bearer ") && bearer.length() > 7) {
      return bearer.substring(7);
    }
    return null;
  }
}
