package demo.cafemenu.domain.order;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "order_items",
    uniqueConstraints = @UniqueConstraint(name="uk_orderitem_order_product", columnNames={"order_id","product_id"}),
    indexes = {
        @Index(name="idx_item_order", columnList="order_id"),
        @Index(name="idx_item_product", columnList="product_id")
    })
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class OrderItem {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  /** 헤더(주문) */
  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "order_id", nullable = false)
  @Setter
  private Order order;

  @Column(nullable = false)
  private Long productId;

  /** 주문 시점의 단가(스냅샷) */
  @Column(nullable = false)
  private Integer unitPrice;

  /** 수량 */
  @Column(nullable = false)
  private Integer quantity;

  /** 라인 금액 = unitPrice * quantity (계산 프로퍼티) */
  public int getLineAmount() {
    return unitPrice * quantity;
  }

  public void addQuantity(int delta) {
    this.quantity += delta;
  }

}
