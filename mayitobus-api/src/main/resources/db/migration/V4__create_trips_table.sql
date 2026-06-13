CREATE TABLE trips (
                       id BIGSERIAL PRIMARY KEY,
                       route_id BIGINT NOT NULL,
                       bus_id BIGINT NOT NULL,
                       departure_datetime TIMESTAMP NOT NULL,
                       status VARCHAR(30) NOT NULL DEFAULT 'SCHEDULED',
                       created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                       CONSTRAINT fk_trips_route FOREIGN KEY (route_id) REFERENCES routes(id),
                       CONSTRAINT fk_trips_bus FOREIGN KEY (bus_id) REFERENCES buses(id),
                       CONSTRAINT uk_trips_bus_departure UNIQUE (bus_id, departure_datetime)
);

CREATE INDEX idx_trips_departure_datetime ON trips (departure_datetime);
