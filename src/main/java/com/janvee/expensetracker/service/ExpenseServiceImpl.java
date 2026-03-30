package com.janvee.expensetracker.service;

import com.janvee.expensetracker.dto.ExpenseDTO;
import com.janvee.expensetracker.entity.Expense;
import com.janvee.expensetracker.exception.ExpenseNotFoundException;
import com.janvee.expensetracker.repository.ExpenseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import java.util.List;
@Service
public class ExpenseServiceImpl implements ExpenseService {
    @Autowired
    private ExpenseRepository expenseRepository;
    @Override
    public Expense saveExpense(Expense expense) {
        return expenseRepository.save(expense);
    }
    @Override
    public Expense getExpenseById(Long id) {
        return expenseRepository.findById(id)
                .orElseThrow(() ->
                        new ExpenseNotFoundException("Expense not found with id " + id));
    }
    @Override
    public void deleteExpense(Long id) {
        expenseRepository.deleteById(id);
    }
    @Override
    public Expense updateExpense(Long id, Expense expense) {
        Expense existingExpense = expenseRepository.findById(id)
                .orElseThrow(() ->
                        new ExpenseNotFoundException("Expense not found with id " + id));
        existingExpense.setCategory(expense.getCategory());
        existingExpense.setAmount(expense.getAmount());
        return expenseRepository.save(existingExpense);
    }
    @Override
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
    @Override
    public Page<ExpenseDTO> getAllExpenses(Pageable pageable) {
        return expenseRepository.findAll(pageable).map(this::mapToDTO);
    }
    private ExpenseDTO mapToDTO(Expense expense) {
        ExpenseDTO dto = new ExpenseDTO();
        dto.setId(expense.getId());
        dto.setCategory(expense.getCategory());
        dto.setAmount(expense.getAmount());
        return dto;
    }
}