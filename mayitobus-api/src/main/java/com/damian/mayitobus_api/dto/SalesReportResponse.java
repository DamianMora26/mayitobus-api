package com.damian.mayitobus_api.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public class SalesReportResponse {

    private LocalDate fromDate;
    private LocalDate toDate;
    private Integer soldTickets;
    private Integer cancelledTickets;
    private BigDecimal grossRevenue;
    private BigDecimal cancelledRevenue;
    private BigDecimal netRevenue;
    private List<DailySalesReportResponse> dailyReports;

    public SalesReportResponse(LocalDate fromDate, LocalDate toDate, Integer soldTickets, Integer cancelledTickets,
                               BigDecimal grossRevenue, BigDecimal cancelledRevenue,
                               List<DailySalesReportResponse> dailyReports) {
        this.fromDate = fromDate;
        this.toDate = toDate;
        this.soldTickets = soldTickets;
        this.cancelledTickets = cancelledTickets;
        this.grossRevenue = grossRevenue;
        this.cancelledRevenue = cancelledRevenue;
        this.netRevenue = grossRevenue.subtract(cancelledRevenue);
        this.dailyReports = dailyReports;
    }

    public LocalDate getFromDate() {
        return fromDate;
    }

    public LocalDate getToDate() {
        return toDate;
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

    public List<DailySalesReportResponse> getDailyReports() {
        return dailyReports;
    }
}
