package demo.cafemenu.global.config;

import demo.cafemenu.domain.product.entity.Product;
import demo.cafemenu.domain.product.repository.ProductRepository;
import demo.cafemenu.domain.user.entity.Role;
import demo.cafemenu.domain.user.entity.User;
import demo.cafemenu.domain.user.reposiitory.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        initProducts();
        initUsers();
    }

    private void initProducts() {
        if (productRepository.count() == 0) {
            Product product1 = Product.builder()
                    .name("아메리카노")
                    .price(4000)
                    .description("진한 에스프레소")
                    .build();

            Product product2 = Product.builder()
                    .name("라떼")
                    .price(4500)
                    .description("부드러운 우유 커피")
                    .build();

            Product product3 = Product.builder()
                    .name("카푸치노")
                    .price(4500)
                    .description("거품이 풍부한 커피")
                    .build();

            Product product4 = Product.builder()
                    .name("모카")
                    .price(5000)
                    .description("초콜릿이 들어간 커피")
                    .build();

            productRepository.save(product1);
            productRepository.save(product2);
            productRepository.save(product3);
            productRepository.save(product4);

            System.out.println("더미 상품 데이터가 생성되었습니다.");
        }
    }

    private void initUsers() {
        if (userRepository.findByEmail("admin@test.com").isEmpty()) {
            userRepository.save(
                    User.builder()
                            .email("admin@test.com")
                            .password(passwordEncoder.encode("Admin1234!"))
                            .name("관리자")
                            .role(Role.ROLE_ADMIN)
                            .build()
            );
            System.out.println("관리자 계정 생성 완료: admin@test.com / Admin1234!");
        }

        if (userRepository.findByEmail("user@test.com").isEmpty()) {
            userRepository.save(
                    User.builder()
                            .email("user@test.com")
                            .password(passwordEncoder.encode("User1234!"))
                            .name("일반유저")
                            .role(Role.ROLE_USER)
                            .build()
            );
            System.out.println("일반 유저 계정 생성 완료: user@test.com / User1234!");
        }
    }
}