package com.janvee.expensetracker.repository;

import com.janvee.expensetracker.entity.GroupExpenseSplit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GroupExpenseSplitRepository extends JpaRepository<GroupExpenseSplit, Long> {
    List<GroupExpenseSplit> findByGroupExpenseId(Long groupExpenseId);
    List<GroupExpenseSplit> findByUserEmail(String email);
}
