package demo.cafemenu.domain.user.reposiitory;

import demo.cafemenu.domain.user.entity.User;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

  boolean existsByEmail(String email);

<<<<<<< HEAD
    Long findIdByEmail(String email);
=======
  Optional<User> findByEmail(String email);

>>>>>>> 29634445a5a4114268b42b861064d915315315c7
}
