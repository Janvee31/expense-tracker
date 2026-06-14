package com.janvee.expensetracker.controller;

import com.janvee.expensetracker.dto.FamilyGroupDTO;
import com.janvee.expensetracker.dto.UserDTO;
import com.janvee.expensetracker.dto.GroupChatMessageDTO;
import com.janvee.expensetracker.entity.Expense;
import com.janvee.expensetracker.entity.FamilyGroup;
import com.janvee.expensetracker.entity.User;
import com.janvee.expensetracker.entity.GroupChatMessage;
import com.janvee.expensetracker.entity.GroupMembership;
import com.janvee.expensetracker.repository.ExpenseRepository;
import com.janvee.expensetracker.repository.FamilyGroupRepository;
import com.janvee.expensetracker.repository.UserRepository;
import com.janvee.expensetracker.repository.GroupChatMessageRepository;
import com.janvee.expensetracker.repository.GroupMembershipRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/family")
@CrossOrigin(origins = "http://localhost:5173")
public class FamilyController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FamilyGroupRepository familyGroupRepository;

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private GroupChatMessageRepository groupChatMessageRepository;

    @Autowired
    private GroupMembershipRepository groupMembershipRepository;

    private User getLoggedInUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getName())) {
            throw new RuntimeException("Unauthorized");
        }
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private FamilyGroupDTO convertToDTO(FamilyGroup group) {
        if (group == null) return null;
        FamilyGroupDTO dto = new FamilyGroupDTO();
        dto.setId(group.getId());
        dto.setName(group.getName());
        dto.setInviteCode(group.getInviteCode());
        dto.setMembers(group.getMembers().stream()
                .map(m -> new UserDTO(m.getEmail(), m.getProfileIcon()))
                .collect(Collectors.toList()));
        return dto;
    }

    @GetMapping("/list")
    public List<FamilyGroupDTO> getFamilyList() {
        User user = getLoggedInUser();
        return user.getFamilyGroups().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @PostMapping("/create")
    public FamilyGroupDTO createFamily(@RequestBody Map<String, String> request) {
        User user = getLoggedInUser();
        String name = request.get("name");
        if (name == null || name.trim().isEmpty()) {
            throw new RuntimeException("Group name is required");
        }

        String inviteCode = generateInviteCode();
        FamilyGroup group = new FamilyGroup(name, inviteCode);
        group = familyGroupRepository.save(group);

        user.getFamilyGroups().add(group);
        userRepository.save(user);

        // Record GroupMembership with join date = Feb 1, 2026 (matching timeline for flatmates)
        GroupMembership membership = new GroupMembership(user, group, LocalDate.of(2026, 2, 1));
        groupMembershipRepository.save(membership);

        // Fetch refreshed group to ensure member list includes user
        group = familyGroupRepository.findById(group.getId()).orElse(group);
        return convertToDTO(group);
    }

    @PostMapping("/join")
    public FamilyGroupDTO joinFamily(@RequestBody Map<String, String> request) {
        User user = getLoggedInUser();
        String inviteCode = request.get("inviteCode");
        if (inviteCode == null || inviteCode.trim().isEmpty()) {
            throw new RuntimeException("Invite code is required");
        }

        FamilyGroup group = familyGroupRepository.findByInviteCode(inviteCode.trim().toUpperCase())
                .orElseThrow(() -> new RuntimeException("Invalid invite code"));

        if (user.getFamilyGroups().contains(group)) {
            throw new RuntimeException("You are already a member of this family group");
        }

        user.getFamilyGroups().add(group);
        userRepository.save(user);

        // Record GroupMembership with join date = current date
        GroupMembership membership = new GroupMembership(user, group, LocalDate.now());
        groupMembershipRepository.save(membership);

        // Fetch refreshed group to ensure member list includes user
        group = familyGroupRepository.findById(group.getId()).orElse(group);
        return convertToDTO(group);
    }

    @PostMapping("/{groupId}/leave")
    public Map<String, String> leaveFamily(@PathVariable Long groupId) {
        User user = getLoggedInUser();
        FamilyGroup group = familyGroupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Family group not found"));

        if (!user.getFamilyGroups().contains(group)) {
            throw new RuntimeException("User is not a member of this family group");
        }

        // Set leftDate in GroupMembership to today
        Optional<GroupMembership> optionalMembership = groupMembershipRepository.findByGroupIdAndUserEmailAndLeftDateIsNull(groupId, user.getEmail());
        if (optionalMembership.isPresent()) {
            GroupMembership membership = optionalMembership.get();
            membership.setLeftDate(LocalDate.now());
            groupMembershipRepository.save(membership);
        }

        user.getFamilyGroups().remove(group);
        userRepository.save(user);

        // Remove from memory list and check if group becomes empty of active members
        group.getMembers().remove(user);
        
        // Check if there are any active memberships left
        List<GroupMembership> activeMembers = groupMembershipRepository.findByGroupId(groupId).stream()
                .filter(m -> m.getLeftDate() == null)
                .collect(Collectors.toList());

        if (activeMembers.isEmpty()) {
            // Delete messages first to prevent foreign key errors
            List<GroupChatMessage> messages = groupChatMessageRepository.findByFamilyGroupIdOrderByTimestampAsc(groupId);
            groupChatMessageRepository.deleteAll(messages);
            
            // Delete all memberships for this group
            List<GroupMembership> allMemberships = groupMembershipRepository.findByGroupId(groupId);
            groupMembershipRepository.deleteAll(allMemberships);
            
            familyGroupRepository.delete(group);
        } else {
            familyGroupRepository.save(group);
        }

        Map<String, String> response = new HashMap<>();
        response.put("message", "Left family group successfully");
        return response;
    }

    @GetMapping("/{groupId}/memberships")
    public List<Map<String, Object>> getMemberships(@PathVariable Long groupId) {
        List<GroupMembership> memberships = groupMembershipRepository.findByGroupIdOrCreate(groupId, familyGroupRepository);
        List<Map<String, Object>> result = new ArrayList<>();
        for (GroupMembership m : memberships) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", m.getId());
            map.put("email", m.getUser().getEmail());
            map.put("profileIcon", m.getUser().getProfileIcon());
            map.put("joinedDate", m.getJoinedDate());
            map.put("leftDate", m.getLeftDate());
            result.add(map);
        }
        return result;
    }

    @PutMapping("/{groupId}/memberships/{membershipId}")
    public Map<String, String> updateMembership(
            @PathVariable Long groupId,
            @PathVariable Long membershipId,
            @RequestBody Map<String, String> request) {
        
        GroupMembership membership = groupMembershipRepository.findById(membershipId)
                .orElseThrow(() -> new RuntimeException("Membership not found"));
        
        if (request.containsKey("joinedDate")) {
            membership.setJoinedDate(LocalDate.parse(request.get("joinedDate")));
        }
        if (request.containsKey("leftDate")) {
            String leftDateStr = request.get("leftDate");
            if (leftDateStr == null || leftDateStr.trim().isEmpty() || "null".equals(leftDateStr)) {
                membership.setLeftDate(null);
            } else {
                membership.setLeftDate(LocalDate.parse(leftDateStr));
            }
        }
        groupMembershipRepository.save(membership);
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Membership dates updated successfully");
        return response;
    }


    @PostMapping("/update-icon")
    public UserDTO updateProfileIcon(@RequestBody Map<String, String> request) {
        User user = getLoggedInUser();
        String icon = request.get("profileIcon");
        if (icon == null || icon.trim().isEmpty()) {
            throw new RuntimeException("Profile icon is required");
        }

        user.setProfileIcon(icon);
        userRepository.save(user);

        return new UserDTO(user.getEmail(), user.getProfileIcon());
    }

    @GetMapping("/{groupId}/expenses")
    public List<Expense> getFamilyExpenses(@PathVariable Long groupId) {
        User user = getLoggedInUser();
        FamilyGroup group = familyGroupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Family group not found"));

        if (!user.getFamilyGroups().contains(group)) {
            throw new RuntimeException("Access denied: You are not a member of this family group");
        }

        List<String> emails = group.getMembers().stream()
                .map(User::getEmail)
                .collect(Collectors.toList());

        List<Expense> allExpenses = new ArrayList<>();
        for (String email : emails) {
            allExpenses.addAll(expenseRepository.findByUserEmail(email));
        }

        // Sort by date descending
        allExpenses.sort((e1, e2) -> {
            if (e1.getDate() == null && e2.getDate() == null) return 0;
            if (e1.getDate() == null) return 1;
            if (e2.getDate() == null) return -1;
            return e2.getDate().compareTo(e1.getDate());
        });

        return allExpenses;
    }

    @GetMapping("/{groupId}/chat")
    public List<GroupChatMessageDTO> getChatHistory(@PathVariable Long groupId) {
        User user = getLoggedInUser();
        FamilyGroup group = familyGroupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Family group not found"));

        if (!user.getFamilyGroups().contains(group)) {
            throw new RuntimeException("Access denied: You are not a member of this family group");
        }

        // Build a map of email -> icon for fast lookup
        Map<String, String> emailToIconMap = group.getMembers().stream()
                .collect(Collectors.toMap(
                        User::getEmail,
                        m -> m.getProfileIcon() != null ? m.getProfileIcon() : "👤",
                        (i1, i2) -> i1
                ));

        List<GroupChatMessage> messages = groupChatMessageRepository.findByFamilyGroupIdOrderByTimestampAsc(groupId);

        return messages.stream()
                .map(m -> new GroupChatMessageDTO(
                        m.getId(),
                        m.getContent(),
                        m.getTimestamp(),
                        m.getSenderEmail(),
                        emailToIconMap.getOrDefault(m.getSenderEmail(), "👤")
                ))
                .collect(Collectors.toList());
    }

    @PostMapping("/{groupId}/chat")
    public GroupChatMessageDTO sendChatMessage(@PathVariable Long groupId, @RequestBody Map<String, String> request) {
        User user = getLoggedInUser();
        FamilyGroup group = familyGroupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Family group not found"));

        if (!user.getFamilyGroups().contains(group)) {
            throw new RuntimeException("Access denied: You are not a member of this family group");
        }

        String content = request.get("content");
        if (content == null || content.trim().isEmpty()) {
            throw new RuntimeException("Message content cannot be empty");
        }

        GroupChatMessage msg = new GroupChatMessage(content, user.getEmail(), group);
        msg = groupChatMessageRepository.save(msg);

        return new GroupChatMessageDTO(
                msg.getId(),
                msg.getContent(),
                msg.getTimestamp(),
                msg.getSenderEmail(),
                user.getProfileIcon()
        );
    }

    private String generateInviteCode() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        StringBuilder sb = new StringBuilder();
        Random random = new Random();
        for (int i = 0; i < 6; i++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        String code = sb.toString();
        // Check uniqueness
        if (familyGroupRepository.findByInviteCode(code).isPresent()) {
            return generateInviteCode();
        }
        return code;
    }
}
