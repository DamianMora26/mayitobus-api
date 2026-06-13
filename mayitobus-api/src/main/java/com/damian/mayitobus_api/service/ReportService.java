package com.damian.mayitobus_api.service;

import com.damian.mayitobus_api.dto.DailySalesReportResponse;
import com.damian.mayitobus_api.dto.SalesReportResponse;
import com.damian.mayitobus_api.entity.Ticket;
import com.damian.mayitobus_api.repository.TicketRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class ReportService {

    private final TicketRepository ticketRepository;

    public ReportService(TicketRepository ticketRepository) {
        this.ticketRepository = ticketRepository;
    }

    @Transactional(readOnly = true)
    public SalesReportResponse getSalesReport(LocalDate fromDate, LocalDate toDate) {
        if (fromDate.isAfter(toDate)) {
            throw new IllegalArgumentException("La fecha inicial no puede ser mayor que la fecha final");
        }

        LocalDateTime start = fromDate.atStartOfDay();
        LocalDateTime end = toDate.atTime(LocalTime.MAX);

        List<Ticket> soldTickets = ticketRepository.findBySoldAtBetweenOrderBySoldAtAsc(start, end);
        List<Ticket> cancelledTickets = ticketRepository.findByCancelledAtBetweenOrderByCancelledAtAsc(start, end);

        List<DailySalesReportResponse> dailyReports = buildDailyReports(fromDate, toDate, soldTickets, cancelledTickets);

        BigDecimal grossRevenue = sumPrices(soldTickets);
        BigDecimal cancelledRevenue = sumPrices(cancelledTickets);

        return new SalesReportResponse(
                fromDate,
                toDate,
                soldTickets.size(),
                cancelledTickets.size(),
                grossRevenue,
                cancelledRevenue,
                dailyReports
        );
    }

    private List<DailySalesReportResponse> buildDailyReports(LocalDate fromDate, LocalDate toDate,
                                                             List<Ticket> soldTickets,
                                                             List<Ticket> cancelledTickets) {
        List<DailySalesReportResponse> dailyReports = new ArrayList<>();
        LocalDate currentDate = fromDate;

        while (!currentDate.isAfter(toDate)) {
            LocalDate reportDate = currentDate;

            List<Ticket> soldOnDate = soldTickets.stream()
                    .filter(ticket -> ticket.getSoldAt().toLocalDate().equals(reportDate))
                    .toList();

            List<Ticket> cancelledOnDate = cancelledTickets.stream()
                    .filter(ticket -> ticket.getCancelledAt().toLocalDate().equals(reportDate))
                    .toList();

            dailyReports.add(new DailySalesReportResponse(
                    reportDate,
                    soldOnDate.size(),
                    cancelledOnDate.size(),
                    sumPrices(soldOnDate),
                    sumPrices(cancelledOnDate)
            ));

            currentDate = currentDate.plusDays(1);
        }

        return dailyReports;
    }

    private BigDecimal sumPrices(List<Ticket> tickets) {
        return tickets.stream()
                .map(Ticket::getPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
