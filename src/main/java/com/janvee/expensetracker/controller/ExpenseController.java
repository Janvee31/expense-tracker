    package com.janvee.expensetracker.controller;
    import com.janvee.expensetracker.dto.ExpenseDTO;
    import jakarta.validation.Valid;
    import com.janvee.expensetracker.entity.Expense;
    import com.janvee.expensetracker.service.ExpenseService;
    import org.springframework.beans.factory.annotation.Autowired;
    import org.springframework.web.bind.annotation.*;
    import org.springframework.data.domain.Page;
    import org.springframework.data.domain.PageRequest;
    import org.springframework.data.domain.Pageable;
    import org.springframework.data.domain.Sort;
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
        public Page<ExpenseDTO> getAllExpenses(
                @RequestParam(defaultValue = "0") int page,
                @RequestParam(defaultValue = "5") int size,
                @RequestParam(defaultValue = "id") String sortBy
        ) {
            Pageable pageable = PageRequest.of(page, size, Sort.by(sortBy));
            return expenseService.getAllExpenses(pageable);
        }
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
