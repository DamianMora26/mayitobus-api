CREATE TABLE tickets (
                         id BIGSERIAL PRIMARY KEY,
                         trip_id BIGINT NOT NULL,
                         seller_user_id BIGINT NOT NULL,
                         passenger_name VARCHAR(120) NOT NULL,
                         seat_number INTEGER NOT NULL,
                         price NUMERIC(10, 2) NOT NULL,
                         status VARCHAR(30) NOT NULL DEFAULT 'SOLD',
                         sold_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                         CONSTRAINT fk_tickets_trip FOREIGN KEY (trip_id) REFERENCES trips(id),
                         CONSTRAINT fk_tickets_seller_user FOREIGN KEY (seller_user_id) REFERENCES users(id),
                         CONSTRAINT uk_tickets_trip_seat UNIQUE (trip_id, seat_number)
);

CREATE INDEX idx_tickets_trip_id ON tickets (trip_id);
CREATE INDEX idx_tickets_sold_at ON tickets (sold_at);
