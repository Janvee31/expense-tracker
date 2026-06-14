package com.janvee.expensetracker.repository;

import com.janvee.expensetracker.entity.GroupMembership;
import com.janvee.expensetracker.entity.FamilyGroup;
import com.janvee.expensetracker.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface GroupMembershipRepository extends JpaRepository<GroupMembership, Long> {
    List<GroupMembership> findByGroupId(Long groupId);
    List<GroupMembership> findByUserEmail(String email);
    Optional<GroupMembership> findByGroupIdAndUserEmailAndLeftDateIsNull(Long groupId, String email);
    Optional<GroupMembership> findByGroupIdAndUserIdAndLeftDateIsNull(Long groupId, Long userId);

    default List<GroupMembership> findByGroupIdOrCreate(Long groupId, FamilyGroupRepository familyGroupRepository) {
        List<GroupMembership> memberships = findByGroupId(groupId);
        if (memberships.isEmpty()) {
            Optional<FamilyGroup> groupOpt = familyGroupRepository.findById(groupId);
            if (groupOpt.isPresent()) {
                FamilyGroup group = groupOpt.get();
                for (User member : group.getMembers()) {
                    GroupMembership m = new GroupMembership(member, group, LocalDate.of(2026, 2, 1));
                    save(m);
                }
                memberships = findByGroupId(groupId);
            }
        }
        return memberships;
    }
}
