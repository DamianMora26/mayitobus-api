CREATE TABLE buses (
                       id BIGSERIAL PRIMARY KEY,
                       bus_number VARCHAR(20) NOT NULL UNIQUE,
                       license_plate VARCHAR(20) NOT NULL UNIQUE,
                       model VARCHAR(80) NOT NULL,
                       capacity INTEGER NOT NULL,
                       status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
                       created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);