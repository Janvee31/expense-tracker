package com.janvee.expensetracker.controller;

import com.janvee.expensetracker.entity.Expense;
import com.janvee.expensetracker.repository.ExpenseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/expenses")
@CrossOrigin(origins = "http://localhost:5173")
public class ExpenseController {

    @Autowired
    private ExpenseRepository expenseRepository;

    private String getLoggedInEmail() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getName())) {
            throw new RuntimeException("Unauthorized");
        }
        return auth.getName();
    }

    @GetMapping
    public List<Expense> getExpenses() {
        return expenseRepository.findByUserEmail(getLoggedInEmail());
    }

    @PostMapping
    public Expense addExpense(@RequestBody Expense expense) {
        expense.setUserEmail(getLoggedInEmail());
        return expenseRepository.save(expense);
    }

    @DeleteMapping("/{id}")
    public void deleteExpense(@PathVariable Long id) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Expense not found"));
        
        if (!expense.getUserEmail().equals(getLoggedInEmail())) {
            throw new RuntimeException("Unauthorized to delete this expense");
        }
        expenseRepository.deleteById(id);
    }

    @PutMapping("/{id}")
    public Expense updateExpense(@PathVariable Long id, @RequestBody Expense updatedExpense) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Expense not found"));

        if (!expense.getUserEmail().equals(getLoggedInEmail())) {
            throw new RuntimeException("Unauthorized to update this expense");
        }

        expense.setAmount(updatedExpense.getAmount());
        expense.setCategory(updatedExpense.getCategory());
        expense.setDate(updatedExpense.getDate());
        // Do not update the user email!

        return expenseRepository.save(expense);
    }
}