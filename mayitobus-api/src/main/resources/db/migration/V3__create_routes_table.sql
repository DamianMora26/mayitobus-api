CREATE TABLE routes (
                        id BIGSERIAL PRIMARY KEY,
                        origin VARCHAR(80) NOT NULL,
                        destination VARCHAR(80) NOT NULL,
                        base_price NUMERIC(10, 2) NOT NULL,
                        estimated_duration_minutes INTEGER NOT NULL,
                        active BOOLEAN NOT NULL DEFAULT TRUE,
                        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                        CONSTRAINT uk_routes_origin_destination UNIQUE (origin, destination)
);
