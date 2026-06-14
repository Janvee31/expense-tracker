package com.janvee.expensetracker.service;

import org.springframework.stereotype.Service;
import java.time.LocalDate;

@Service
public class ExchangeRateService {

    // Default rate for USD to INR. Fulfills Priya's trip requirement.
    private static final double USD_TO_INR_RATE = 83.0;

    /**
     * Get the exchange rate to base currency (INR)
     * @param currency foreign currency code (e.g. "USD", "INR")
     * @param date date of the expense
     * @return conversion multiplier (1.0 for INR, 83.0 for USD)
     */
    public double getExchangeRateToBase(String currency, LocalDate date) {
        if (currency == null || currency.trim().isEmpty()) {
            return 1.0;
        }

        String cur = currency.trim().toUpperCase();

        if (cur.equals("USD") || cur.equals("$")) {
            return USD_TO_INR_RATE;
        }

        return 1.0;
    }

    /**
     * Convert an amount from foreign currency to base currency (INR)
     */
    public double convertToBase(double amount, String currency, LocalDate date) {
        return amount * getExchangeRateToBase(currency, date);
    }
}
