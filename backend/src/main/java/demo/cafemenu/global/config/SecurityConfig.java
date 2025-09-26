package demo.cafemenu.global.config;

import demo.cafemenu.global.jwt.JwtAuthenticationFilter;
import demo.cafemenu.global.jwt.JwtTokenProvider;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

  private final JwtTokenProvider tokenProvider;

  @Bean
  public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    http
        .csrf(csrf -> csrf.disable())
        .cors(cors -> {})  // CorsConfig의 bean 사용
        .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .formLogin(f -> f.disable())
        .httpBasic(b -> b.disable())
        .authorizeHttpRequests(auth -> auth
            // 공개 엔드포인트 (회원가입/로그인은 다음 브랜치에서 구현 예정)
            .requestMatchers("/h2-console/**").permitAll()
            .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
            .requestMatchers(HttpMethod.POST, "/api/auth/signup", "/api/auth/login").permitAll()

            // 역할 기반
            .requestMatchers("/api/admin/**").hasAuthority("ROLE_ADMIN")
            .requestMatchers("/api/user/**").hasAuthority("ROLE_USER")
            .requestMatchers("/api/order/**").hasAuthority("ROLE_USER")

            .anyRequest().authenticated() // 그 외 모든 요청은 인증 필요
        );

    // H2 콘솔 iframe 허용
    http.headers(headers -> headers.frameOptions(frame -> frame.sameOrigin()));

    // JWT 필터 연결
    http.addFilterBefore(new JwtAuthenticationFilter(tokenProvider),
        UsernamePasswordAuthenticationFilter.class);

    http.exceptionHandling(ex -> ex
        .authenticationEntryPoint((req, res, e) ->
            res.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized"))
        .accessDeniedHandler((req, res, e) ->
            res.sendError(HttpServletResponse.SC_FORBIDDEN, "Forbidden"))
    );

    return http.build();
  }

}
