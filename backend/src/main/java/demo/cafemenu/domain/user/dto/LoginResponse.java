package demo.cafemenu.domain.user.dto;

public record LoginResponse(
    String accessToken,
    String tokenType,
    String role,
    Long userId,
    String email,
    String name
) {
  public static LoginResponse of(String token, String role, Long userId, String email, String name) {
    return new LoginResponse(token, "Bearer", role, userId, email, name);
  }
}
