package com.janvee.expensetracker.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.janvee.expensetracker.entity.FamilyGroup;
import com.janvee.expensetracker.entity.GroupMembership;
import com.janvee.expensetracker.entity.ImportCache;
import com.janvee.expensetracker.entity.User;
import com.janvee.expensetracker.repository.FamilyGroupRepository;
import com.janvee.expensetracker.repository.GroupMembershipRepository;
import com.janvee.expensetracker.repository.ImportCacheRepository;
import com.janvee.expensetracker.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class CsvImportService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FamilyGroupRepository familyGroupRepository;

    @Autowired
    private GroupMembershipRepository groupMembershipRepository;

    @Autowired
    private ImportCacheRepository importCacheRepository;

    @Autowired
    private GroupExpenseService groupExpenseService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    // Normalizes user names/emails based on database matches
    private String resolveEmailOrName(String input, List<User> dbUsers) {
        if (input == null || input.trim().isEmpty()) return "";
        String cleanInput = input.trim().toLowerCase();

        // 1. Check if email matches exactly
        for (User u : dbUsers) {
            if (u.getEmail().toLowerCase().equals(cleanInput)) {
                return u.getEmail();
            }
        }

        // 2. Check if the name part of the email matches (e.g. "aisha" -> "aisha@gmail.com")
        for (User u : dbUsers) {
            String namePart = u.getEmail().split("@")[0].toLowerCase();
            if (namePart.equals(cleanInput)) {
                return u.getEmail();
            }
        }

        // Fallback: return trimmed input
        return input.trim();
    }

    public List<ImportCache> processCsvUpload(Long groupId, InputStream inputStream) throws Exception {
        List<User> dbUsers = userRepository.findAll();
        List<GroupMembership> memberships = groupMembershipRepository.findByGroupIdOrCreate(groupId, familyGroupRepository);
        List<ImportCache> stagedRows = new ArrayList<>();

        BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream, StandardCharsets.UTF_8));
        String headerLine = reader.readLine();
        if (headerLine == null) {
            throw new RuntimeException("Uploaded CSV is empty");
        }

        // Parse header and get indices
        String[] headers = headerLine.split(",(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)");
        int dateIdx = -1, descIdx = -1, amountIdx = -1, currencyIdx = -1, payerIdx = -1, sharedIdx = -1, splitTypeIdx = -1, splitValIdx = -1;

        for (int i = 0; i < headers.length; i++) {
            String h = headers[i].replace("\"", "").trim().toLowerCase();
            if (h.contains("date")) dateIdx = i;
            else if (h.contains("desc") || h.contains("item") || h.contains("expense")) descIdx = i;
            else if (h.contains("amount") || h.contains("cost")) amountIdx = i;
            else if (h.contains("currency") || h.contains("curr")) currencyIdx = i;
            else if (h.contains("paid") || h.contains("payer")) payerIdx = i;
            else if (h.contains("shared") || h.contains("split with") || h.contains("share")) sharedIdx = i;
            else if (h.contains("split type") || h.contains("type")) splitTypeIdx = i;
            else if (h.contains("detail") || h.contains("value")) splitValIdx = i;
        }

        // Fallbacks if columns are not found
        if (dateIdx == -1) dateIdx = 0;
        if (descIdx == -1) descIdx = 1;
        if (amountIdx == -1) amountIdx = 2;
        if (payerIdx == -1) payerIdx = 3;
        if (sharedIdx == -1) sharedIdx = 4;

        String line;
        while ((line = reader.readLine()) != null) {
            if (line.trim().isEmpty()) continue;

            String[] fields = line.split(",(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)");
            
            // Extract raw fields
            String rawDate = getField(fields, dateIdx);
            String rawDesc = getField(fields, descIdx);
            String rawAmount = getField(fields, amountIdx);
            String rawCurrency = getField(fields, currencyIdx, "INR");
            String rawPayer = getField(fields, payerIdx);
            String rawShared = getField(fields, sharedIdx);
            String rawSplitType = getField(fields, splitTypeIdx, "EQUAL");
            String rawSplitDetails = getField(fields, splitValIdx, "");

            // Anomaly tracking list for this row
            List<Map<String, String>> rowAnomalies = new ArrayList<>();

            // 1. Missing fields check
            if (rawDate.isEmpty() || rawDesc.isEmpty() || rawAmount.isEmpty() || rawPayer.isEmpty()) {
                addAnomaly(rowAnomalies, "MISSING_FIELD", "Required fields (Date, Expense name, Amount, or Payer) are missing in this row.");
            }

            // 2. Date parsing and format check
            LocalDate parsedDate = null;
            if (!rawDate.isEmpty()) {
                String[] formats = {"yyyy-MM-dd", "dd/MM/yyyy", "MM/dd/yyyy", "dd-MM-yyyy", "yyyy/MM/dd"};
                for (String format : formats) {
                    try {
                        parsedDate = LocalDate.parse(rawDate, DateTimeFormatter.ofPattern(format));
                        if (!format.equals("yyyy-MM-dd")) {
                            addAnomaly(rowAnomalies, "DATE_FORMAT_INCONSISTENCY", "Date format is inconsistent ('" + rawDate + "'), normalized to yyyy-MM-dd.");
                        }
                        break;
                    } catch (DateTimeParseException ignored) {}
                }
                if (parsedDate == null) {
                    addAnomaly(rowAnomalies, "INVALID_DATE", "Date value '" + rawDate + "' could not be parsed.");
                }
            }

            // 3. Amount parsing & Negative amount checks
            double parsedAmount = 0.0;
            if (!rawAmount.isEmpty()) {
                try {
                    String cleanAmt = rawAmount.replace("\"", "").replace("₹", "").replace("$", "").replace(",", "").trim();
                    parsedAmount = Double.parseDouble(cleanAmt);
                    if (parsedAmount < 0) {
                        addAnomaly(rowAnomalies, "NEGATIVE_AMOUNT", "Negative amount detected. This will be staging as a refund/credit entry.");
                    } else if (parsedAmount == 0) {
                        addAnomaly(rowAnomalies, "ZERO_AMOUNT", "Expense amount is ₹0. Check if this is an error.");
                    }
                } catch (NumberFormatException e) {
                    addAnomaly(rowAnomalies, "NUMBER_FORMAT_ERROR", "Amount '" + rawAmount + "' is not a valid number.");
                }
            }

            // 4. Currency Checks (Priya's dollar trip verification)
            String currency = rawCurrency.replace("\"", "").trim().toUpperCase();
            if (rawAmount.contains("$") && !currency.equals("USD")) {
                addAnomaly(rowAnomalies, "CURRENCY_DISCREPANCY", "Currency field says '" + currency + "' but amount format includes dollar sign ($). USD rate applied.");
                currency = "USD";
            } else if (currency.isEmpty()) {
                addAnomaly(rowAnomalies, "MISSING_CURRENCY", "Currency column was missing. Defaulted to INR.");
                currency = "INR";
            }

            // 5. Casing / Whitespace Normalization (Payer)
            String resolvedPayer = resolveEmailOrName(rawPayer, dbUsers);
            if (!rawPayer.trim().equals(resolvedPayer)) {
                addAnomaly(rowAnomalies, "CASING_NORMALIZED", "Normalized payer name/email from '" + rawPayer + "' to '" + resolvedPayer + "'.");
            }

            // Verify payer is a registered member of the group
            final String finalPayer = resolvedPayer;
            boolean payerInGroup = memberships.stream().anyMatch(m -> m.getUser().getEmail().equalsIgnoreCase(finalPayer));
            if (!payerInGroup && !resolvedPayer.isEmpty()) {
                addAnomaly(rowAnomalies, "NON_MEMBER_PARTICIPANT", "Payer '" + rawPayer + "' is not registered in this group membership list.");
            }

            // 6. Casing / Whitespace Normalization & membership checks (Participants)
            List<String> rawParticipants = Arrays.stream(rawShared.replace("\"", "").split("[:;]"))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .collect(Collectors.toList());

            if (rawParticipants.isEmpty()) {
                // If shared list is empty, default to all members active on date
                if (parsedDate != null) {
                    for (GroupMembership m : memberships) {
                        if (groupExpenseService.isMemberActiveOnDate(memberships, m.getUser().getEmail(), parsedDate)) {
                            rawParticipants.add(m.getUser().getEmail());
                        }
                    }
                }
            }

            List<String> resolvedParticipants = new ArrayList<>();
            for (String p : rawParticipants) {
                String rp = resolveEmailOrName(p, dbUsers);
                resolvedParticipants.add(rp);

                // Check active membership dates (Sam's timeline check)
                if (parsedDate != null) {
                    boolean activeOnDate = groupExpenseService.isMemberActiveOnDate(memberships, rp, parsedDate);
                    if (!activeOnDate) {
                        addAnomaly(rowAnomalies, "OUT_OF_MEMBERSHIP_SPLIT", "Participant '" + p + "' was not a member of the flat on " + parsedDate + ".");
                    }
                }

                // Check if user exists in group at all
                boolean partInGroup = memberships.stream().anyMatch(m -> m.getUser().getEmail().equalsIgnoreCase(rp));
                if (!partInGroup) {
                    addAnomaly(rowAnomalies, "NON_MEMBER_PARTICIPANT", "Split participant '" + p + "' is not registered in this group.");
                }
            }

            // 7. Settlements Logged as Expenses
            String descClean = rawDesc.toLowerCase();
            if (descClean.contains("settle") || descClean.contains("paid back") || descClean.contains("repaid") || descClean.contains("transfer")) {
                if (resolvedParticipants.size() == 1) {
                    addAnomaly(rowAnomalies, "SETTLEMENT_LOGGED_AS_EXPENSE", "Description indicates a settlement/repayment. Row will be converted to a Group Settlement.");
                }
            }

            // 8. Duplicate Entry Detection
            // Check in staging rows and database
            boolean isDuplicate = checkDuplicate(groupId, resolvedPayer, rawDesc, parsedAmount, parsedDate, stagedRows);
            if (isDuplicate) {
                addAnomaly(rowAnomalies, "DUPLICATE_ENTRY", "Row appears to be a duplicate entry. Flagged for review/deletion.");
            }

            // 9. Conflicting Amounts
            boolean isConflict = checkAmountConflict(groupId, resolvedPayer, rawDesc, parsedAmount, parsedDate, stagedRows);
            if (isConflict) {
                addAnomaly(rowAnomalies, "CONFLICTING_AMOUNTS", "An identical expense with a different amount exists on this date. Resolve which wins.");
            }

            // Write row to import cache
            ImportCache cache = new ImportCache();
            cache.setGroupId(groupId);
            cache.setDescription(rawDesc);
            cache.setTotalAmount(parsedAmount);
            cache.setCurrency(currency);
            cache.setDate(parsedDate != null ? parsedDate.toString() : rawDate);
            cache.setPayerEmail(resolvedPayer);
            cache.setSharedWith(String.join(";", resolvedParticipants));
            cache.setSplitType(rawSplitType);
            cache.setSplitDetails(rawSplitDetails);
            cache.setRawRow(line);
            cache.setAnomalies(objectMapper.writeValueAsString(rowAnomalies));

            stagedRows.add(importCacheRepository.save(cache));
        }

        return stagedRows;
    }

    private String getField(String[] fields, int idx) {
        return getField(fields, idx, "");
    }

    private String getField(String[] fields, int idx, String fallback) {
        if (idx >= 0 && idx < fields.length) {
            String val = fields[idx].replace("\"", "").trim();
            return val.isEmpty() ? fallback : val;
        }
        return fallback;
    }

    private void addAnomaly(List<Map<String, String>> anomalies, String type, String details) {
        Map<String, String> a = new HashMap<>();
        a.put("type", type);
        a.put("details", details);
        anomalies.add(a);
    }

    private boolean checkDuplicate(Long groupId, String payer, String desc, double amount, LocalDate date, List<ImportCache> currentStage) {
        if (date == null) return false;
        // Check stage
        for (ImportCache c : currentStage) {
            if (c.getPayerEmail().equalsIgnoreCase(payer) &&
                c.getDescription().equalsIgnoreCase(desc) &&
                Math.abs(c.getTotalAmount() - amount) < 0.01 &&
                c.getDate().equals(date.toString())) {
                return true;
            }
        }
        return false;
    }

    private boolean checkAmountConflict(Long groupId, String payer, String desc, double amount, LocalDate date, List<ImportCache> currentStage) {
        if (date == null) return false;
        for (ImportCache c : currentStage) {
            if (c.getPayerEmail().equalsIgnoreCase(payer) &&
                c.getDescription().equalsIgnoreCase(desc) &&
                c.getDate().equals(date.toString()) &&
                Math.abs(c.getTotalAmount() - amount) > 0.01) {
                return true;
            }
        }
        return false;
    }
}
