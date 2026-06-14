package com.janvee.expensetracker.repository;

import com.janvee.expensetracker.entity.GroupSettlement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GroupSettlementRepository extends JpaRepository<GroupSettlement, Long> {
    List<GroupSettlement> findByGroupId(Long groupId);
}
