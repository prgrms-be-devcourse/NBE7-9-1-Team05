package demo.cafemenu.domain.order;

import demo.cafemenu.domain.BaseTimeEntity;
import demo.cafemenu.domain.customer.Customer;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.LocalDate;
import java.util.ArrayList;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(
    name = "orders",
    uniqueConstraints = {
        // 같은 고객 + 같은 배치일에 주문은 1건만 → "하루 여러 번 주문해도 합치기" 보장
        @UniqueConstraint(name = "uk_order_customer_batch", columnNames = {"customer_id", "batch_date"})
    },
    indexes = {
        @Index(name = "idx_order_customer_batch", columnList = "customer_id,batch_date")
    }
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Order extends BaseTimeEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  /** 고객 */
  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "customer_id", nullable = false)
  private Customer customer;

  /** 배송 배치일 (14시 마감 규칙 적용된 날짜) */
  @Column(name = "batch_date", nullable = false)
  private LocalDate batchDate;

  @Enumerated(EnumType.STRING)
  @Column(length = 20, nullable = false)
  private OrderStatus status;

  /** 주문 총액(원) — items의 lineAmount 합 */
  @Column(nullable = false)
  private Integer totalAmount;

  /** 주문 품목들 */
  @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
  @Builder.Default
  private List<OrderItem> items = new ArrayList<>();

  public void changeStatus(OrderStatus status) {
    this.status = status;
  }
}
