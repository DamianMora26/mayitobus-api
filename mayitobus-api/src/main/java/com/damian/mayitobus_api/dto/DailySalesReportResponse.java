package com.damian.mayitobus_api.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class DailySalesReportResponse {

    private LocalDate date;
    private Integer soldTickets;
    private Integer cancelledTickets;
    private BigDecimal grossRevenue;
    private BigDecimal cancelledRevenue;
    private BigDecimal netRevenue;

    public DailySalesReportResponse(LocalDate date, Integer soldTickets, Integer cancelledTickets,
                                    BigDecimal grossRevenue, BigDecimal cancelledRevenue) {
        this.date = date;
        this.soldTickets = soldTickets;
        this.cancelledTickets = cancelledTickets;
        this.grossRevenue = grossRevenue;
        this.cancelledRevenue = cancelledRevenue;
        this.netRevenue = grossRevenue.subtract(cancelledRevenue);
    }

    public LocalDate getDate() {
        return date;
    }

    public Integer getSoldTickets() {
        return soldTickets;
    }

    public Integer getCancelledTickets() {
        return cancelledTickets;
    }

    public BigDecimal getGrossRevenue() {
        return grossRevenue;
    }

    public BigDecimal getCancelledRevenue() {
        return cancelledRevenue;
    }

    public BigDecimal getNetRevenue() {
        return netRevenue;
    }
}
