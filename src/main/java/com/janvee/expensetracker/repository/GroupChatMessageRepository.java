package com.janvee.expensetracker.repository;

import com.janvee.expensetracker.entity.GroupChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GroupChatMessageRepository extends JpaRepository<GroupChatMessage, Long> {
    List<GroupChatMessage> findByFamilyGroupIdOrderByTimestampAsc(Long familyGroupId);
}
