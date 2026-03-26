package com.janvee.expensetracker.service;

import java.util.List;

import com.janvee.expensetracker.exception.ExpenseNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.janvee.expensetracker.entity.Expense;
import com.janvee.expensetracker.repository.ExpenseRepository;

@Service
public class ExpenseServiceImpl implements ExpenseService {

    @Autowired
    private ExpenseRepository expenseRepository;

    @Override
    public Expense saveExpense(Expense expense) {
        return expenseRepository.save(expense);
    }

    @Override
    public List<Expense> getAllExpenses() {
        return expenseRepository.findAll();
    }

    @Override
    public Expense getExpenseById(Long id) {

        return expenseRepository.findById(id)
                .orElseThrow(() -> new ExpenseNotFoundException("Expense not found with id " + id));
    }
    @Override
    public void deleteExpense(Long id) {
        expenseRepository.deleteById(id);
    }
    public Expense updateExpense(Long id, Expense expense) {
        Expense existingExpense = expenseRepository.findById(id).orElse(null);
        if(existingExpense != null) {
            existingExpense.setCategory(expense.getCategory());
            existingExpense.setAmount(expense.getAmount());
            return expenseRepository.save(existingExpense);
        }
        return null;
    }
    public List<Expense> getExpensesByCategory(String category) {
        return expenseRepository.findByCategory(category);
    }
    @Override
    public double getTotalExpenses() {

        List<Expense> expenses = expenseRepository.findAll();

        double total = 0;

        for (Expense expense : expenses) {
            total += expense.getAmount();
        }

        return total;
    }
}