package demo.cafemenu.global.jwt;

import demo.cafemenu.domain.user.entity.Role;
import demo.cafemenu.domain.user.entity.User;
import demo.cafemenu.global.security.UserDetailsImpl;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

@Component
public class JwtTokenProvider {

  @Value("${app.jwt.secret}")
  private String secretKey;

  private final long accessTokenValidity = 30 * 60 * 1000L;

  private Key key;

  @PostConstruct
  public void init() {
    this.key = Keys.hmacShaKeyFor(secretKey.getBytes(StandardCharsets.UTF_8));
  }

  /** 액세스 토큰 생성: email(subject), role(claim) 포함 */
  public String createAccessToken(User user) {
    Date now = new Date();
    Date exp = new Date(now.getTime() + accessTokenValidity);

    return Jwts.builder()
        .setSubject(user.getEmail()) // JWT payload의 subject(email)
        .claim("id", user.getId())
        .claim("role", user.getRole().name())
        .setIssuedAt(now) // 발급 시간
        .setExpiration(exp) // 만료 시간
        .signWith(key, SignatureAlgorithm.HS256) // 암호화 알고리즘
        .compact();
  }

  // JWT 토큰 유효성 검사
  public void validateToken(String token) throws JwtException {
    Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
  }

  // 인증 객체 생성
  public Authentication getAuthentication(String token) {
    Claims claims = Jwts.parserBuilder().setSigningKey(key).build()
        .parseClaimsJws(token).getBody();

    String email = claims.getSubject();
    Long id = claims.get("id", Number.class).longValue();
    Role role = Role.valueOf(claims.get("role", String.class));

    UserDetailsImpl userDetails = new UserDetailsImpl(id, email, null, role);
    return new UsernamePasswordAuthenticationToken(
        userDetails, null, userDetails.getAuthorities()
    );
  }
}
