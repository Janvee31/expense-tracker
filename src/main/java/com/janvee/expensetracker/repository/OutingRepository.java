package com.janvee.expensetracker.repository;

import com.janvee.expensetracker.entity.Outing;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OutingRepository extends JpaRepository<Outing, Long> {
    List<Outing> findByCreatorEmail(String creatorEmail);
}
