package com.damian.mayitobus_api.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.ZoneId;

@Service
public class TimeService {

    private final ZoneId zoneId;

    public TimeService(@Value("${app.time-zone:America/Hermosillo}") String timeZone) {
        this.zoneId = ZoneId.of(timeZone);
    }

    public LocalDateTime now() {
        return LocalDateTime.now(zoneId);
    }
}
