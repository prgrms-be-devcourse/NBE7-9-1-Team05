package demo.cafemenu.domain.user.dto;

public record SignupResponse(
    Long userId,
    String email,
    String name
) {}
