package com.janvee.expensetracker.service;

import com.janvee.expensetracker.entity.*;
import com.janvee.expensetracker.repository.*;
import com.janvee.expensetracker.dto.SettlementDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;

@Service
public class GroupExpenseService {

    @Autowired
    private GroupExpenseRepository groupExpenseRepository;

    @Autowired
    private GroupSettlementRepository groupSettlementRepository;

    @Autowired
    private GroupMembershipRepository groupMembershipRepository;

    @Autowired
    private FamilyGroupRepository familyGroupRepository;

    // Checks if a member was active in the group on a specific date
    public boolean isMemberActiveOnDate(List<GroupMembership> memberships, String email, LocalDate date) {
        for (GroupMembership m : memberships) {
            if (m.getUser().getEmail().equalsIgnoreCase(email)) {
                LocalDate joined = m.getJoinedDate();
                LocalDate left = m.getLeftDate();
                if ((joined == null || !joined.isAfter(date)) && (left == null || !left.isBefore(date))) {
                    return true;
                }
            }
        }
        return false;
    }

    // Calculates net balances for all group members (historical and active)
    public Map<String, Double> calculateBalances(Long groupId) {
        List<GroupMembership> memberships = groupMembershipRepository.findByGroupIdOrCreate(groupId, familyGroupRepository);
        Map<String, Double> netBalances = new HashMap<>();

        // Initialize balances for all historical members
        for (GroupMembership m : memberships) {
            netBalances.put(m.getUser().getEmail(), 0.0);
        }

        List<GroupExpense> expenses = groupExpenseRepository.findByGroupId(groupId);

        // Process group expenses
        for (GroupExpense expense : expenses) {
            String payerEmail = expense.getPayer().getEmail();
            double baseAmount = expense.getTotalAmount() * expense.getExchangeRateToBase();
            LocalDate expenseDate = expense.getDate();

            // Payer gets credit for paying
            if (netBalances.containsKey(payerEmail)) {
                netBalances.put(payerEmail, netBalances.get(payerEmail) + baseAmount);
            }

            // Find splits that were active on the expense date
            List<GroupExpenseSplit> activeSplits = new ArrayList<>();
            for (GroupExpenseSplit split : expense.getSplits()) {
                if (isMemberActiveOnDate(memberships, split.getUser().getEmail(), expenseDate)) {
                    activeSplits.add(split);
                }
            }

            double activeCount = activeSplits.size();
            if (activeCount == 0) continue;

            // Debit active participants for their shares
            for (GroupExpenseSplit split : activeSplits) {
                String participantEmail = split.getUser().getEmail();
                double share = 0.0;

                if ("EQUAL".equalsIgnoreCase(split.getSplitType())) {
                    share = baseAmount / activeCount;
                } else if ("PERCENT".equalsIgnoreCase(split.getSplitType())) {
                    share = (split.getSplitValue() / 100.0) * baseAmount;
                } else { // EXACT
                    share = split.getSplitValue() * expense.getExchangeRateToBase();
                }

                if (netBalances.containsKey(participantEmail)) {
                    netBalances.put(participantEmail, netBalances.get(participantEmail) - share);
                }
            }
        }

        // Process settlements
        List<GroupSettlement> settlements = groupSettlementRepository.findByGroupId(groupId);
        for (GroupSettlement settlement : settlements) {
            String debtor = settlement.getDebtor().getEmail();
            String creditor = settlement.getCreditor().getEmail();
            double amount = settlement.getAmount();

            if (netBalances.containsKey(debtor)) {
                netBalances.put(debtor, netBalances.get(debtor) + amount);
            }
            if (netBalances.containsKey(creditor)) {
                netBalances.put(creditor, netBalances.get(creditor) - amount);
            }
        }

        // Round values to 2 decimal places to handle float precision issues
        for (Map.Entry<String, Double> entry : netBalances.entrySet()) {
            netBalances.put(entry.getKey(), Math.round(entry.getValue() * 100.0) / 100.0);
        }

        return netBalances;
    }

    // Minimized transactions list (Aisha's view)
    public List<SettlementDTO> getMinimizedSettlements(Long groupId) {
        Map<String, Double> netBalances = calculateBalances(groupId);
        List<SettlementDTO> settlements = new ArrayList<>();
        Map<String, Double> tempBalances = new HashMap<>(netBalances);

        while (true) {
            String maxDebtor = null;
            String maxCreditor = null;
            double minVal = 0.0; // largest debtor (most negative)
            double maxVal = 0.0; // largest creditor (most positive)

            for (Map.Entry<String, Double> entry : tempBalances.entrySet()) {
                double val = entry.getValue();
                if (val < minVal) {
                    minVal = val;
                    maxDebtor = entry.getKey();
                }
                if (val > maxVal) {
                    maxVal = val;
                    maxCreditor = entry.getKey();
                }
            }

            if (maxDebtor == null || maxCreditor == null || Math.abs(minVal) < 0.01 || Math.abs(maxVal) < 0.01) {
                break;
            }

            double settleAmount = Math.min(-minVal, maxVal);
            settleAmount = Math.round(settleAmount * 100.0) / 100.0;

            if (settleAmount > 0.01) {
                settlements.add(new SettlementDTO(maxDebtor, maxCreditor, settleAmount));
            }

            tempBalances.put(maxDebtor, tempBalances.get(maxDebtor) + settleAmount);
            tempBalances.put(maxCreditor, tempBalances.get(maxCreditor) - settleAmount);
        }

        return settlements;
    }

    // Detailed breakdown ledger (Rohan's view)
    public Map<String, List<Map<String, Object>>> getDetailedAuditLedgers(Long groupId) {
        List<GroupMembership> memberships = groupMembershipRepository.findByGroupIdOrCreate(groupId, familyGroupRepository);
        Map<String, List<Map<String, Object>>> auditLedgers = new HashMap<>();

        for (GroupMembership m : memberships) {
            auditLedgers.put(m.getUser().getEmail(), new ArrayList<>());
        }

        List<GroupExpense> expenses = groupExpenseRepository.findByGroupId(groupId);

        // Track expense-level logs
        for (GroupExpense expense : expenses) {
            String payerEmail = expense.getPayer().getEmail();
            double baseAmount = expense.getTotalAmount() * expense.getExchangeRateToBase();
            LocalDate expenseDate = expense.getDate();

            // Payer entry
            if (auditLedgers.containsKey(payerEmail)) {
                Map<String, Object> log = new HashMap<>();
                log.put("date", expenseDate);
                log.put("type", "PAID_EXPENSE");
                log.put("description", "Paid for " + expense.getDescription() + " (" + expense.getCurrency() + " " + expense.getTotalAmount() + ")");
                log.put("amount", baseAmount);
                auditLedgers.get(payerEmail).add(log);
            }

            // Find splits that were active on the expense date
            List<GroupExpenseSplit> activeSplits = new ArrayList<>();
            for (GroupExpenseSplit split : expense.getSplits()) {
                if (isMemberActiveOnDate(memberships, split.getUser().getEmail(), expenseDate)) {
                    activeSplits.add(split);
                }
            }

            double activeCount = activeSplits.size();
            if (activeCount == 0) continue;

            for (GroupExpenseSplit split : activeSplits) {
                String participantEmail = split.getUser().getEmail();
                double share = 0.0;

                if ("EQUAL".equalsIgnoreCase(split.getSplitType())) {
                    share = baseAmount / activeCount;
                } else if ("PERCENT".equalsIgnoreCase(split.getSplitType())) {
                    share = (split.getSplitValue() / 100.0) * baseAmount;
                } else { // EXACT
                    share = split.getSplitValue() * expense.getExchangeRateToBase();
                }

                if (auditLedgers.containsKey(participantEmail)) {
                    Map<String, Object> log = new HashMap<>();
                    log.put("date", expenseDate);
                    log.put("type", "EXPENSE_SHARE");
                    log.put("description", "Share of " + expense.getDescription() + " (" + split.getSplitType() + " split)");
                    log.put("amount", -share);
                    auditLedgers.get(participantEmail).add(log);
                }
            }
        }

        // Process settlements
        List<GroupSettlement> settlements = groupSettlementRepository.findByGroupId(groupId);
        for (GroupSettlement settlement : settlements) {
            String debtor = settlement.getDebtor().getEmail();
            String creditor = settlement.getCreditor().getEmail();
            double amount = settlement.getAmount();

            if (auditLedgers.containsKey(debtor)) {
                Map<String, Object> log = new HashMap<>();
                log.put("date", settlement.getDate());
                log.put("type", "SETTLEMENT_PAYMENT");
                log.put("description", "Paid settlement to " + creditor);
                log.put("amount", amount);
                auditLedgers.get(debtor).add(log);
            }

            if (auditLedgers.containsKey(creditor)) {
                Map<String, Object> log = new HashMap<>();
                log.put("date", settlement.getDate());
                log.put("type", "SETTLEMENT_RECEIVE");
                log.put("description", "Received settlement from " + debtor);
                log.put("amount", -amount);
                auditLedgers.get(creditor).add(log);
            }
        }

        return auditLedgers;
    }
}
