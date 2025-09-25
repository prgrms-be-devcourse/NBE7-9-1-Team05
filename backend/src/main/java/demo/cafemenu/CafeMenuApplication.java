package demo.cafemenu;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@EnableJpaAuditing
@SpringBootApplication
public class CafeMenuApplication {

    public static void main(String[] args) {
        SpringApplication.run(CafeMenuApplication.class, args);
    }

}
