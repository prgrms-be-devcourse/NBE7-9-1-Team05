package demo.cafemenu.domain.user.reposiitory;

import demo.cafemenu.domain.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

  boolean existsByEmail(String email);

    Long findIdByEmail(String email);
}
