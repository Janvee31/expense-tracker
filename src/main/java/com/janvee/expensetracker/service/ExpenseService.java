package com.janvee.expensetracker.service;
import java.util.List;

import com.janvee.expensetracker.dto.ExpenseDTO;
import com.janvee.expensetracker.entity.Expense;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
public interface ExpenseService {
    Expense saveExpense(Expense expense);
    Expense getExpenseById(Long id);
    void deleteExpense(Long id);
    Expense updateExpense(Long id, Expense expense);
    List<Expense> getExpensesByCategory(String category);
    double getTotalExpenses();
    Page<ExpenseDTO> getAllExpenses(Pageable pageable);
}