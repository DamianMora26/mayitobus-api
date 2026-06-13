CREATE TABLE roles (
                       id BIGSERIAL PRIMARY KEY,
                       name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE users (
                       id BIGSERIAL PRIMARY KEY,
                       full_name VARCHAR(120) NOT NULL,
                       email VARCHAR(120) NOT NULL UNIQUE,
                       phone VARCHAR(20),
                       password_hash VARCHAR(255) NOT NULL,
                       role_id BIGINT NOT NULL,
                       active BOOLEAN NOT NULL DEFAULT TRUE,
                       created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                       CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(id)
);

INSERT INTO roles (name) VALUES
                             ('TERMINAL_MANAGER'),
                             ('TICKET_SELLER');