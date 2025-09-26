package demo.cafemenu.domain.product.dto;

public record ProductResponse(
    Long id, String name, Integer price, String description
) {}
