package com.janvee.expensetracker.service;
import java.util.List;
import com.janvee.expensetracker.entity.Expense;
public interface ExpenseService {
    Expense saveExpense(Expense expense);
    List<Expense> getAllExpenses();
    Expense getExpenseById(Long id);
    void deleteExpense(Long id);
}
