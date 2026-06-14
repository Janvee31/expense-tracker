package com.janvee.expensetracker.controller;

import com.janvee.expensetracker.entity.*;
import com.janvee.expensetracker.repository.*;
import com.janvee.expensetracker.service.GroupExpenseService;
import com.janvee.expensetracker.service.CsvImportService;
import com.janvee.expensetracker.dto.SettlementDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/family/{groupId}/shared-expenses")
@CrossOrigin(origins = "http://localhost:5173")
public class GroupExpenseController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FamilyGroupRepository familyGroupRepository;

    @Autowired
    private GroupExpenseRepository groupExpenseRepository;

    @Autowired
    private GroupExpenseSplitRepository groupExpenseSplitRepository;

    @Autowired
    private GroupSettlementRepository groupSettlementRepository;

    @Autowired
    private GroupMembershipRepository groupMembershipRepository;

    @Autowired
    private GroupExpenseService groupExpenseService;

    @Autowired
    private CsvImportService csvImportService;

    @Autowired
    private ImportCacheRepository importCacheRepository;

    @Autowired
    private com.janvee.expensetracker.service.ExchangeRateService exchangeRateService;

    private User getLoggedInUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getName())) {
            throw new RuntimeException("Unauthorized");
        }
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping
    public List<GroupExpense> getGroupExpenses(@PathVariable Long groupId) {
        // Ensure logged-in user is a member
        User user = getLoggedInUser();
        FamilyGroup group = familyGroupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));
        
        List<GroupMembership> memberships = groupMembershipRepository.findByGroupIdOrCreate(groupId, familyGroupRepository);
        boolean isMember = memberships.stream().anyMatch(m -> m.getUser().getId().equals(user.getId()));
        if (!isMember) {
            throw new RuntimeException("Access Denied: You are not a member of this group");
        }

        List<GroupExpense> expenses = groupExpenseRepository.findByGroupId(groupId);
        expenses.sort((e1, e2) -> e2.getDate().compareTo(e1.getDate()));
        return expenses;
    }

    @PostMapping("/create")
    public GroupExpense createGroupExpense(@PathVariable Long groupId, @RequestBody GroupExpenseRequest request) {
        User loggedInUser = getLoggedInUser();
        FamilyGroup group = familyGroupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        User payer = userRepository.findByEmail(request.getPayerEmail())
                .orElseThrow(() -> new RuntimeException("Payer not found"));

        LocalDate date = LocalDate.parse(request.getDate());
        double rate = request.getExchangeRateToBase();
        if (rate <= 0) {
            rate = exchangeRateService.getExchangeRateToBase(request.getCurrency(), date);
        }


        GroupExpense expense = new GroupExpense(
                group,
                request.getDescription(),
                request.getTotalAmount(),
                request.getCurrency(),
                rate,
                date,
                payer
        );

        // Save expense first to generate ID
        expense = groupExpenseRepository.save(expense);

        List<GroupMembership> memberships = groupMembershipRepository.findByGroupIdOrCreate(groupId, familyGroupRepository);
        
        // Count active splits on the transaction date
        List<SplitRequest> activeSplits = new ArrayList<>();
        for (SplitRequest sr : request.getSplits()) {
            if (groupExpenseService.isMemberActiveOnDate(memberships, sr.getEmail(), date)) {
                activeSplits.add(sr);
            }
        }

        double activeCount = activeSplits.size();
        if (activeCount == 0) {
            throw new RuntimeException("Cannot save expense: No group members were active on " + date);
        }

        double baseAmount = request.getTotalAmount() * rate;
        List<GroupExpenseSplit> splits = new ArrayList<>();

        for (SplitRequest sr : activeSplits) {
            User participant = userRepository.findByEmail(sr.getEmail())
                    .orElseThrow(() -> new RuntimeException("Participant not found"));

            double share = 0.0;
            if ("EQUAL".equalsIgnoreCase(sr.getSplitType())) {
                share = baseAmount / activeCount;
            } else if ("PERCENT".equalsIgnoreCase(sr.getSplitType())) {
                share = (sr.getSplitValue() / 100.0) * baseAmount;
            } else { // EXACT
                share = sr.getSplitValue() * rate;
            }

            GroupExpenseSplit split = new GroupExpenseSplit(
                    expense,
                    participant,
                    share,
                    sr.getSplitType(),
                    sr.getSplitValue()
            );
            splits.add(groupExpenseSplitRepository.save(split));
        }

        expense.setSplits(splits);
        return groupExpenseRepository.save(expense);
    }

    @GetMapping("/balances")
    public Map<String, Double> getBalances(@PathVariable Long groupId) {
        return groupExpenseService.calculateBalances(groupId);
    }

    @GetMapping("/settlements")
    public List<SettlementDTO> getMinimizedSettlements(@PathVariable Long groupId) {
        return groupExpenseService.getMinimizedSettlements(groupId);
    }

    @GetMapping("/ledger")
    public Map<String, List<Map<String, Object>>> getLedger(@PathVariable Long groupId) {
        return groupExpenseService.getDetailedAuditLedgers(groupId);
    }

    @PostMapping("/settle")
    public GroupSettlement settleDebt(@PathVariable Long groupId, @RequestBody SettlementRequest request) {
        FamilyGroup group = familyGroupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        User debtor = userRepository.findByEmail(request.getDebtorEmail())
                .orElseThrow(() -> new RuntimeException("Debtor not found"));

        User creditor = userRepository.findByEmail(request.getCreditorEmail())
                .orElseThrow(() -> new RuntimeException("Creditor not found"));

        GroupSettlement settlement = new GroupSettlement(
                group,
                debtor,
                creditor,
                request.getAmount(),
                LocalDate.now()
        );

        return groupSettlementRepository.save(settlement);
    }

    @PostMapping("/import/upload")
    public List<ImportCache> uploadCsv(
            @PathVariable Long groupId,
            @RequestParam("file") MultipartFile file) throws Exception {
        
        List<ImportCache> oldCache = importCacheRepository.findByGroupIdAndResolvedFalseAndIgnoredFalse(groupId);
        importCacheRepository.deleteAll(oldCache);

        return csvImportService.processCsvUpload(groupId, file.getInputStream());
    }

    @GetMapping("/import/staged")
    public List<ImportCache> getStagedExpenses(@PathVariable Long groupId) {
        return importCacheRepository.findByGroupIdAndResolvedFalseAndIgnoredFalse(groupId);
    }

    @PostMapping("/import/resolve/{cacheId}")
    public ImportCache resolveStagedRow(
            @PathVariable Long groupId,
            @PathVariable Long cacheId,
            @RequestBody Map<String, Object> request) {
        
        ImportCache cache = importCacheRepository.findById(cacheId)
                .orElseThrow(() -> new RuntimeException("Staged entry not found"));

        if (request.containsKey("description")) cache.setDescription((String) request.get("description"));
        if (request.containsKey("totalAmount")) cache.setTotalAmount(Double.parseDouble(request.get("totalAmount").toString()));
        if (request.containsKey("currency")) cache.setCurrency((String) request.get("currency"));
        if (request.containsKey("date")) cache.setDate((String) request.get("date"));
        if (request.containsKey("payerEmail")) cache.setPayerEmail((String) request.get("payerEmail"));
        if (request.containsKey("sharedWith")) cache.setSharedWith((String) request.get("sharedWith"));
        if (request.containsKey("ignored")) cache.setIgnored((Boolean) request.get("ignored"));
        if (request.containsKey("resolved")) cache.setResolved((Boolean) request.get("resolved"));

        return importCacheRepository.save(cache);
    }

    @PostMapping("/import/approve")
    public Map<String, String> approveImport(@PathVariable Long groupId) {
        List<ImportCache> staged = importCacheRepository.findByGroupIdAndResolvedFalseAndIgnoredFalse(groupId);
        FamilyGroup group = familyGroupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        List<GroupMembership> memberships = groupMembershipRepository.findByGroupIdOrCreate(groupId, familyGroupRepository);

        int expensesCount = 0;
        int settlementsCount = 0;

        for (ImportCache c : staged) {
            if (c.isIgnored() || c.isResolved()) continue;

            User payer = userRepository.findByEmail(c.getPayerEmail()).orElse(null);
            if (payer == null) {
                c.setIgnored(true);
                importCacheRepository.save(c);
                continue;
            }

            LocalDate date = LocalDate.parse(c.getDate());
            double rate = exchangeRateService.getExchangeRateToBase(c.getCurrency(), date);

            boolean isSettlement = false;
            String descClean = c.getDescription().toLowerCase();
            List<String> participants = Arrays.stream(c.getSharedWith().split(";"))
                    .filter(s -> !s.isEmpty())
                    .collect(Collectors.toList());

            if (descClean.contains("settle") || descClean.contains("paid back") || descClean.contains("repaid") || descClean.contains("transfer")) {
                if (participants.size() == 1) {
                    isSettlement = true;
                }
            }

            if (isSettlement) {
                User debtor = payer;
                User creditor = userRepository.findByEmail(participants.get(0)).orElse(null);

                if (creditor != null) {
                    GroupSettlement settlement = new GroupSettlement(
                            group,
                            debtor,
                            creditor,
                            c.getTotalAmount() * rate,
                            date
                    );
                    groupSettlementRepository.save(settlement);
                    settlementsCount++;
                }
            } else {
                GroupExpense expense = new GroupExpense(
                        group,
                        c.getDescription(),
                        c.getTotalAmount(),
                        c.getCurrency(),
                        rate,
                        date,
                        payer
                );

                expense = groupExpenseRepository.save(expense);

                List<String> activeParticipants = new ArrayList<>();
                for (String pEmail : participants) {
                    if (groupExpenseService.isMemberActiveOnDate(memberships, pEmail, date)) {
                        activeParticipants.add(pEmail);
                    }
                }

                double activeCount = activeParticipants.size();
                if (activeCount > 0) {
                    List<GroupExpenseSplit> splits = new ArrayList<>();
                    for (String pEmail : activeParticipants) {
                        User participant = userRepository.findByEmail(pEmail).orElse(null);
                        if (participant != null) {
                            double share = 0.0;
                            if ("EQUAL".equalsIgnoreCase(c.getSplitType())) {
                                share = (c.getTotalAmount() * rate) / activeCount;
                            } else if ("PERCENT".equalsIgnoreCase(c.getSplitType())) {
                                share = (c.getTotalAmount() * rate) / activeCount;
                            } else {
                                share = (c.getTotalAmount() * rate) / activeCount;
                            }

                            GroupExpenseSplit split = new GroupExpenseSplit(
                                    expense,
                                    participant,
                                    share,
                                    "EQUAL",
                                    0.0
                            );
                            splits.add(groupExpenseSplitRepository.save(split));
                        }
                    }
                    expense.setSplits(splits);
                    groupExpenseRepository.save(expense);
                    expensesCount++;
                }
            }

            c.setResolved(true);
            importCacheRepository.save(c);
        }

        Map<String, String> response = new HashMap<>();
        response.put("message", "Import approved successfully");
        response.put("expensesImported", String.valueOf(expensesCount));
        response.put("settlementsImported", String.valueOf(settlementsCount));
        return response;
    }

    // Requests DTO classes
    public static class GroupExpenseRequest {
        private String description;
        private double totalAmount;
        private String currency;
        private double exchangeRateToBase;
        private String date;
        private String payerEmail;
        private List<SplitRequest> splits;

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public double getTotalAmount() { return totalAmount; }
        public void setTotalAmount(double totalAmount) { this.totalAmount = totalAmount; }
        public String getCurrency() { return currency; }
        public void setCurrency(String currency) { this.currency = currency; }
        public double getExchangeRateToBase() { return exchangeRateToBase; }
        public void setExchangeRateToBase(double exchangeRateToBase) { this.exchangeRateToBase = exchangeRateToBase; }
        public String getDate() { return date; }
        public void setDate(String date) { this.date = date; }
        public String getPayerEmail() { return payerEmail; }
        public void setPayerEmail(String payerEmail) { this.payerEmail = payerEmail; }
        public List<SplitRequest> getSplits() { return splits; }
        public void setSplits(List<SplitRequest> splits) { this.splits = splits; }
    }

    public static class SplitRequest {
        private String email;
        private String splitType;
        private double splitValue;

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getSplitType() { return splitType; }
        public void setSplitType(String splitType) { this.splitType = splitType; }
        public double getSplitValue() { return splitValue; }
        public void setSplitValue(double splitValue) { this.splitValue = splitValue; }
    }

    public static class SettlementRequest {
        private String debtorEmail;
        private String creditorEmail;
        private double amount;

        public String getDebtorEmail() { return debtorEmail; }
        public void setDebtorEmail(String debtorEmail) { this.debtorEmail = debtorEmail; }
        public String getCreditorEmail() { return creditorEmail; }
        public void setCreditorEmail(String creditorEmail) { this.creditorEmail = creditorEmail; }
        public double getAmount() { return amount; }
        public void setAmount(double amount) { this.amount = amount; }
    }
}
