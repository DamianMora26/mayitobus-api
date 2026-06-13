ALTER TABLE tickets
    ADD COLUMN cancelled_at TIMESTAMP;

ALTER TABLE tickets
    DROP CONSTRAINT uk_tickets_trip_seat;

CREATE UNIQUE INDEX uk_tickets_trip_seat_sold
    ON tickets (trip_id, seat_number)
    WHERE status = 'SOLD';
