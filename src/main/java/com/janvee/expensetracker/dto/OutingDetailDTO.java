package com.janvee.expensetracker.dto;

import com.janvee.expensetracker.entity.Outing;
import java.util.List;
import java.util.Map;

public class OutingDetailDTO {
    private Outing outing;
    private Map<String, Double> netBalances;
    private List<SettlementDTO> settlements;

    public OutingDetailDTO() {}

    public OutingDetailDTO(Outing outing, Map<String, Double> netBalances, List<SettlementDTO> settlements) {
        this.outing = outing;
        this.netBalances = netBalances;
        this.settlements = settlements;
    }

    public Outing getOuting() {
        return outing;
    }

    public void setOuting(Outing outing) {
        this.outing = outing;
    }

    public Map<String, Double> getNetBalances() {
        return netBalances;
    }

    public void setNetBalances(Map<String, Double> netBalances) {
        this.netBalances = netBalances;
    }

    public List<SettlementDTO> getSettlements() {
        return settlements;
    }

    public void setSettlements(List<SettlementDTO> settlements) {
        this.settlements = settlements;
    }
}
