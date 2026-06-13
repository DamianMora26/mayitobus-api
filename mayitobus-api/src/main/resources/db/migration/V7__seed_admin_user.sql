INSERT INTO users (full_name, email, phone, password_hash, role_id, active, created_at)
SELECT
    'Administrador MayitoBus',
    'admin@example.com',
    '0000000000',
    '$2a$10$S0EJxNx/MjxkA1sQnO65T.Hnn.6J2iArhintwL3TrrADs0SvAWZ9O',
    roles.id,
    TRUE,
    CURRENT_TIMESTAMP
FROM roles
WHERE roles.name = 'TERMINAL_MANAGER'
  AND NOT EXISTS (
      SELECT 1
      FROM users
      WHERE users.email = 'admin@example.com'
  );
