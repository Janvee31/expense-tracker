package com.janvee.expensetracker.controller;

import com.janvee.expensetracker.dto.OutingDetailDTO;
import com.janvee.expensetracker.dto.SettlementDTO;
import com.janvee.expensetracker.entity.Expense;
import com.janvee.expensetracker.entity.LeftoverDebt;
import com.janvee.expensetracker.entity.Outing;
import com.janvee.expensetracker.entity.OutingEvent;
import com.janvee.expensetracker.repository.ExpenseRepository;
import com.janvee.expensetracker.repository.OutingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/split")
@CrossOrigin(origins = "http://localhost:5173")
public class SplitController {

    @Autowired
    private OutingRepository outingRepository;

    @Autowired
    private ExpenseRepository expenseRepository;

    private String getLoggedInEmail() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getName())) {
            throw new RuntimeException("Unauthorized");
        }
        return auth.getName();
    }

    @GetMapping("/outings")
    public List<Outing> getOutings() {
        return outingRepository.findByCreatorEmail(getLoggedInEmail());
    }

    @PostMapping("/create")
    public Outing createOuting(@RequestBody Outing outing) {
        String email = getLoggedInEmail();
        outing.setCreatorEmail(email);
        outing.setSettled(false);

        if (outing.getEvents() != null) {
            for (OutingEvent event : outing.getEvents()) {
                event.setOuting(outing);
            }
        }
        if (outing.getLeftoverDebts() != null) {
            for (LeftoverDebt debt : outing.getLeftoverDebts()) {
                debt.setOuting(outing);
            }
        }

        return outingRepository.save(outing);
    }

    @GetMapping("/outing/{id}")
    public OutingDetailDTO getOutingDetail(@PathVariable Long id) {
        String email = getLoggedInEmail();
        Outing outing = outingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Outing not found"));

        if (!outing.getCreatorEmail().equals(email)) {
            throw new RuntimeException("Unauthorized access to this outing");
        }

        // 1. Calculate net balances for each participant
        Map<String, Double> netBalances = new HashMap<>();
        for (String participant : outing.getParticipants()) {
            netBalances.put(participant, 0.0);
        }

        // Process each event
        if (outing.getEvents() != null) {
            for (OutingEvent event : outing.getEvents()) {
                double total = event.getTotalAmount();
                List<String> sharedBy = event.getSharedBy();
                Map<String, Double> paidBy = event.getPaidBy();

                // Add paid amounts
                if (paidBy != null) {
                    for (Map.Entry<String, Double> entry : paidBy.entrySet()) {
                        String payer = entry.getKey();
                        double amountPaid = entry.getValue();
                        netBalances.put(payer, netBalances.getOrDefault(payer, 0.0) + amountPaid);
                    }
                }

                // Subtract shared amounts
                if (sharedBy != null && !sharedBy.isEmpty()) {
                    double shareAmount = total / sharedBy.size();
                    for (String participant : sharedBy) {
                        netBalances.put(participant, netBalances.getOrDefault(participant, 0.0) - shareAmount);
                    }
                }
            }
        }

        // Process leftover debts
        if (outing.getLeftoverDebts() != null) {
            for (LeftoverDebt debt : outing.getLeftoverDebts()) {
                String debtor = debt.getDebtor();
                String creditor = debt.getCreditor();
                double amount = debt.getAmount();

                netBalances.put(debtor, netBalances.getOrDefault(debtor, 0.0) - amount);
                netBalances.put(creditor, netBalances.getOrDefault(creditor, 0.0) + amount);
            }
        }

        // Clean up balances around zero due to double precision
        for (Map.Entry<String, Double> entry : netBalances.entrySet()) {
            double roundedVal = Math.round(entry.getValue() * 100.0) / 100.0;
            netBalances.put(entry.getKey(), roundedVal);
        }

        // 2. Greedy Cash Flow Minimization Algorithm
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

        return new OutingDetailDTO(outing, netBalances, settlements);
    }

    @PostMapping("/outing/{id}/settle")
    public Map<String, Object> settleOuting(@PathVariable Long id) {
        String email = getLoggedInEmail();
        Outing outing = outingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Outing not found"));

        if (!outing.getCreatorEmail().equals(email)) {
            throw new RuntimeException("Unauthorized access to this outing");
        }

        if (outing.isSettled()) {
            Map<String, Object> response = new HashMap<>();
            response.put("status", "already_settled");
            response.put("message", "Outing is already settled");
            return response;
        }

        // Compute net balances to find the logged-in user's share
        OutingDetailDTO details = getOutingDetail(id);
        Map<String, Double> netBalances = details.getNetBalances();

        // Identify which participant represents the logged-in user.
        // Look for "Self" or their email. Fallback to "Self" if not found.
        String userKey = null;
        for (String p : outing.getParticipants()) {
            if (p.equalsIgnoreCase("self") || p.equalsIgnoreCase(email)) {
                userKey = p;
                break;
            }
        }
        if (userKey == null) {
            // Default to first matching participant or "Self"
            userKey = outing.getParticipants().stream()
                    .filter(p -> p.equalsIgnoreCase("self"))
                    .findFirst()
                    .orElse("Self");
        }

        double userBalance = netBalances.getOrDefault(userKey, 0.0);

        if (Math.abs(userBalance) > 0.01) {
            Expense syncExpense = new Expense();
            syncExpense.setUserEmail(email);
            syncExpense.setDate(LocalDate.now());
            syncExpense.setAmount(Math.abs(userBalance));
            syncExpense.setCategory("Split Outing: " + outing.getName());
            syncExpense.setType(userBalance >= 0 ? "INCOME" : "EXPENSE");
            expenseRepository.save(syncExpense);
        }

        outing.setSettled(true);
        outingRepository.save(outing);

        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Outing settled and synced successfully");
        response.put("userBalance", userBalance);
        return response;
    }

    @DeleteMapping("/outing/{id}")
    public Map<String, String> deleteOuting(@PathVariable Long id) {
        String email = getLoggedInEmail();
        Outing outing = outingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Outing not found"));

        if (!outing.getCreatorEmail().equals(email)) {
            throw new RuntimeException("Unauthorized access to this outing");
        }

        outingRepository.delete(outing);

        Map<String, String> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Outing deleted successfully");
        return response;
    }

    @PostMapping("/outing/{id}/event")
    public OutingDetailDTO addEventToOuting(@PathVariable Long id, @RequestBody OutingEvent event) {
        String email = getLoggedInEmail();
        Outing outing = outingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Outing not found"));

        if (!outing.getCreatorEmail().equals(email)) {
            throw new RuntimeException("Unauthorized access to this outing");
        }

        event.setOuting(outing);
        outing.getEvents().add(event);
        outing.setSettled(false);
        outingRepository.save(outing);

        return getOutingDetail(id);
    }

    @PostMapping("/outing/{id}/debt")
    public OutingDetailDTO addDebtToOuting(@PathVariable Long id, @RequestBody LeftoverDebt debt) {
        String email = getLoggedInEmail();
        Outing outing = outingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Outing not found"));

        if (!outing.getCreatorEmail().equals(email)) {
            throw new RuntimeException("Unauthorized access to this outing");
        }

        debt.setOuting(outing);
        outing.getLeftoverDebts().add(debt);
        outing.setSettled(false);
        outingRepository.save(outing);

        return getOutingDetail(id);
    }

    @DeleteMapping("/outing/{id}/event/{eventId}")
    public OutingDetailDTO deleteEventFromOuting(@PathVariable Long id, @PathVariable Long eventId) {
        String email = getLoggedInEmail();
        Outing outing = outingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Outing not found"));

        if (!outing.getCreatorEmail().equals(email)) {
            throw new RuntimeException("Unauthorized access to this outing");
        }

        outing.getEvents().removeIf(e -> e.getId() != null && e.getId().equals(eventId));
        outing.setSettled(false);
        outingRepository.save(outing);

        return getOutingDetail(id);
    }

    @DeleteMapping("/outing/{id}/debt/{debtId}")
    public OutingDetailDTO deleteDebtFromOuting(@PathVariable Long id, @PathVariable Long debtId) {
        String email = getLoggedInEmail();
        Outing outing = outingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Outing not found"));

        if (!outing.getCreatorEmail().equals(email)) {
            throw new RuntimeException("Unauthorized access to this outing");
        }

        outing.getLeftoverDebts().removeIf(d -> d.getId() != null && d.getId().equals(debtId));
        outing.setSettled(false);
        outingRepository.save(outing);

        return getOutingDetail(id);
    }
}
