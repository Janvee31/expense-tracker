package com.janvee.expensetracker;

import com.janvee.expensetracker.entity.*;
import com.janvee.expensetracker.repository.*;
import com.janvee.expensetracker.service.*;
import com.janvee.expensetracker.dto.SettlementDTO;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class ExpenseTrackerApplicationTests {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FamilyGroupRepository familyGroupRepository;

    @Autowired
    private GroupMembershipRepository groupMembershipRepository;

    @Autowired
    private GroupExpenseRepository groupExpenseRepository;

    @Autowired
    private GroupExpenseSplitRepository groupExpenseSplitRepository;

    @Autowired
    private GroupExpenseService groupExpenseService;

    @Autowired
    private CsvImportService csvImportService;

    @Autowired
    private ExchangeRateService exchangeRateService;

    @Test
    void testExchangeRateConversion() {
        // Priya's Currency Converter Check
        double usdRate = exchangeRateService.getExchangeRateToBase("USD", LocalDate.now());
        assertEquals(83.0, usdRate, "USD rate should be ₹83/$1");

        double inrRate = exchangeRateService.getExchangeRateToBase("INR", LocalDate.now());
        assertEquals(1.0, inrRate, "INR rate should be 1.0");

        double convertedUsd = exchangeRateService.convertToBase(10.0, "USD", LocalDate.now());
        assertEquals(830.0, convertedUsd, "10 USD should convert to ₹830");
    }

    @Test
    void testMembershipTimelineLogic() {
        // Setup mock users
        User user1 = userRepository.save(new User("test_aisha@gmail.com", "password"));
        User user2 = userRepository.save(new User("test_sam@gmail.com", "password"));
        FamilyGroup group = familyGroupRepository.save(new FamilyGroup("Test Flat", "TSTCD"));

        // Aisha active timeline: Feb 1, 2026 onwards
        GroupMembership m1 = groupMembershipRepository.save(new GroupMembership(user1, group, LocalDate.of(2026, 2, 1)));
        // Sam active timeline: April 15, 2026 onwards
        GroupMembership m2 = groupMembershipRepository.save(new GroupMembership(user2, group, LocalDate.of(2026, 4, 15)));

        List<GroupMembership> memberships = List.of(m1, m2);

        // March 15th expense: Aisha active, Sam inactive
        assertTrue(groupExpenseService.isMemberActiveOnDate(memberships, "test_aisha@gmail.com", LocalDate.of(2026, 3, 15)));
        assertFalse(groupExpenseService.isMemberActiveOnDate(memberships, "test_sam@gmail.com", LocalDate.of(2026, 3, 15)));

        // May 1st expense: Both active
        assertTrue(groupExpenseService.isMemberActiveOnDate(memberships, "test_aisha@gmail.com", LocalDate.of(2026, 5, 1)));
        assertTrue(groupExpenseService.isMemberActiveOnDate(memberships, "test_sam@gmail.com", LocalDate.of(2026, 5, 1)));
    }

    @Test
    void testCsvImportAnomalyDetection() throws Exception {
        // Setup group and members
        User aisha = userRepository.save(new User("aisha@gmail.com", "pass"));
        User rohan = userRepository.save(new User("rohan@gmail.com", "pass"));
        User sam = userRepository.save(new User("sam@gmail.com", "pass"));
        FamilyGroup group = familyGroupRepository.save(new FamilyGroup("CSV Flat", "CSVCD"));

        // Aisha & Rohan active from Feb 1st
        groupMembershipRepository.save(new GroupMembership(aisha, group, LocalDate.of(2026, 2, 1)));
        groupMembershipRepository.save(new GroupMembership(rohan, group, LocalDate.of(2026, 2, 1)));
        // Sam active from April 15th
        groupMembershipRepository.save(new GroupMembership(sam, group, LocalDate.of(2026, 4, 15)));

        // Create dirty CSV input
        String csvData = "Date,Expense Description,Amount,Currency,Paid By,Shared With\n" +
                "15/02/2026,Trip Groceries,100,USD, aisha ,rohan;sam\n" + // 1. Date format, 2. Casing whitespace, 3. Sam out-of-membership
                "15/02/2026,Trip Groceries,100,USD,aisha,rohan;sam\n" +    // 4. Duplicate Entry
                "15/02/2026,Trip Groceries,120,USD,aisha,rohan\n" +        // 5. Conflicting Amounts
                "10/03/2026,Rohan paid back Aisha,500,INR,rohan,aisha\n" +  // 6. Settlement logged as expense
                "12/03/2026,Gas Bill,-150,INR,rohan,aisha\n" +              // 7. Negative amount
                "14/03/2026,Free Snack,0,INR,rohan,aisha\n" +                // 8. Zero amount
                "16/03/2026,Internet,3000,INR,rohan,aisha;stranger@gmail.com\n"; // 9. Non-member participant

        ByteArrayInputStream inputStream = new ByteArrayInputStream(csvData.getBytes(StandardCharsets.UTF_8));
        List<ImportCache> staged = csvImportService.processCsvUpload(group.getId(), inputStream);

        assertNotNull(staged);
        assertFalse(staged.isEmpty());

        for (int i = 0; i < staged.size(); i++) {
            System.out.println("Row " + i + " Description: " + staged.get(i).getDescription());
            System.out.println("Row " + i + " Anomalies: " + staged.get(i).getAnomalies());
        }

        // Validate staged anomalies are caught
        // Row 0 anomalies (Date format, Casing whitespace, Sam out-of-membership split)
        String r0Anoms = staged.get(0).getAnomalies();
        assertTrue(r0Anoms.contains("DATE_FORMAT_INCONSISTENCY") || r0Anoms.contains("CASING_NORMALIZED") || r0Anoms.contains("OUT_OF_MEMBERSHIP_SPLIT"));

        // Row 1 anomaly (Duplicate)
        assertTrue(staged.get(1).getAnomalies().contains("DUPLICATE_ENTRY"));

        // Row 2 anomaly (Conflicting Amount)
        assertTrue(staged.get(2).getAnomalies().contains("CONFLICTING_AMOUNTS"));

        // Row 3 anomaly (Settlement logged as expense)
        System.out.println("Row 3 Shared: " + staged.get(3).getSharedWith());
        assertTrue(staged.get(3).getAnomalies().contains("SETTLEMENT_LOGGED_AS_EXPENSE"));

        // Row 4 anomaly (Negative amount)
        assertTrue(staged.get(4).getAnomalies().contains("NEGATIVE_AMOUNT"));

        // Row 5 anomaly (Zero amount)
        assertTrue(staged.get(5).getAnomalies().contains("ZERO_AMOUNT"));

        // Row 6 anomaly (Non-member participant)
        assertTrue(staged.get(6).getAnomalies().contains("NON_MEMBER_PARTICIPANT"));
    }

    @Test
    void testCashFlowMinimizationAndAudit() {
        // Setup flatmates
        User aisha = userRepository.save(new User("aisha_debt@gmail.com", "pass"));
        User rohan = userRepository.save(new User("rohan_debt@gmail.com", "pass"));
        User priya = userRepository.save(new User("priya_debt@gmail.com", "pass"));
        FamilyGroup group = familyGroupRepository.save(new FamilyGroup("Debt Flat", "DBTCD"));

        groupMembershipRepository.save(new GroupMembership(aisha, group, LocalDate.of(2026, 2, 1)));
        groupMembershipRepository.save(new GroupMembership(rohan, group, LocalDate.of(2026, 2, 1)));
        groupMembershipRepository.save(new GroupMembership(priya, group, LocalDate.of(2026, 2, 1)));

        // Aisha paid ₹300 for dinner split equally among Aisha, Rohan, Priya (each owes ₹100, Aisha gets ₹200 net credit)
        GroupExpense expense = new GroupExpense(group, "Dinner", 300.0, "INR", 1.0, LocalDate.of(2026, 2, 10), aisha);
        expense = groupExpenseRepository.save(expense);

        // Create manual splits
        GroupExpenseSplit s1 = groupExpenseSplitRepository.save(new GroupExpenseSplit(expense, aisha, 100.0, "EQUAL", 0.0));
        GroupExpenseSplit s2 = groupExpenseSplitRepository.save(new GroupExpenseSplit(expense, rohan, 100.0, "EQUAL", 0.0));
        GroupExpenseSplit s3 = groupExpenseSplitRepository.save(new GroupExpenseSplit(expense, priya, 100.0, "EQUAL", 0.0));
        expense.setSplits(new java.util.ArrayList<>(List.of(s1, s2, s3)));
        expense = groupExpenseRepository.save(expense);

        // Save
        groupExpenseService.calculateBalances(group.getId()); // verify no error

        // Run Cash Flow Minimization
        // With Dinner split:
        // Aisha balance = +200
        // Rohan balance = -100
        // Priya balance = -100
        // Minimized payments should be:
        // Rohan pays Aisha ₹100
        // Priya pays Aisha ₹100
        List<SettlementDTO> settlements = groupExpenseService.getMinimizedSettlements(group.getId());
        assertEquals(2, settlements.size(), "Should minimize to 2 payments");

        SettlementDTO set1 = settlements.get(0);
        assertEquals("aisha_debt@gmail.com", set1.getCreditor());
        assertEquals(100.0, set1.getAmount());

        // Rohan Audit Ledger check
        Map<String, List<Map<String, Object>>> ledgers = groupExpenseService.getDetailedAuditLedgers(group.getId());
        assertTrue(ledgers.containsKey("rohan_debt@gmail.com"));
        List<Map<String, Object>> rohanLogs = ledgers.get("rohan_debt@gmail.com");
        assertEquals(1, rohanLogs.size());
        assertEquals(-100.0, rohanLogs.get(0).get("amount"));
    }
}

