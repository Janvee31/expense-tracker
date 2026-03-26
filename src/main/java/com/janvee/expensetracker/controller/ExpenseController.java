    package com.janvee.expensetracker.controller;
    import jakarta.validation.Valid;
    import com.janvee.expensetracker.entity.Expense;
    import com.janvee.expensetracker.service.ExpenseService;
    import org.springframework.beans.factory.annotation.Autowired;
    import org.springframework.web.bind.annotation.*;

    import java.util.List;

    @RestController
    public class ExpenseController {
        @Autowired
        private ExpenseService expenseService;
        @PostMapping("/expenses")
        public Expense addExpense(@Valid @RequestBody Expense expense){
            return expenseService.saveExpense(expense);
        }
        @GetMapping("/expenses")
        public List<Expense> getAllExpenses() {
            return expenseService.getAllExpenses();
        }
    //    get expense by ID:
        @GetMapping("/expenses/{id}")
        public Expense getExpenseById(@PathVariable Long id){
            return expenseService.getExpenseById(id);
        }
        @DeleteMapping("/expenses/{id}")
        public void deleteExpenseByID(@PathVariable Long id){
            expenseService.deleteExpense(id);
        }
        @PutMapping("/expenses/{id}")
        public Expense updateExpense(@PathVariable Long id, @RequestBody Expense expense) {
            return expenseService.updateExpense(id, expense);
        }
        @GetMapping("/expenses/category/{category}")
        public List<Expense> getExpensesByCategory(@PathVariable String category) {
            return expenseService.getExpensesByCategory(category);
        }
        @GetMapping("/expenses/total")
        public double getTotalExpenses() {
            return expenseService.getTotalExpenses();
        }
    }
