# Autobuses Mayitos

Sistema web para la operacion de una terminal de Autobuses Mayitos. El proyecto incluye una API REST con Spring Boot y un panel administrativo en React para gestionar rutas, autobuses, viajes, venta de boletos, asientos, usuarios y reportes.

## Capturas

### Login

![Login](docs/screenshots/login.png)

### Dashboard

![Dashboard](docs/screenshots/dashboard.png)

### Venta de boletos y boleto imprimible

![Venta de boletos](docs/screenshots/ticket-sale.png)

### Reportes

![Reportes](docs/screenshots/reports.png)

## Stack

- Java 21
- Spring Boot
- Maven
- PostgreSQL
- Flyway
- Spring Web
- Spring Data JPA
- Spring Security
- JWT
- React
- Vite
- TypeScript
- Axios
- TanStack Query
- Tailwind CSS

## Funcionalidades

- Login con JWT.
- Roles `TERMINAL_MANAGER` y `TICKET_SELLER`.
- Gestion de usuarios con activacion y desactivacion.
- Gestion de autobuses con activacion y desactivacion.
- Gestion de rutas con activacion y desactivacion.
- Programacion y cancelacion de viajes.
- Venta y cancelacion de boletos.
- Categorias de boleto con descuento:
  - Normal: 0%
  - Niño: 25%
  - Adulto mayor: 50%
  - Persona discapacitada: 50%
- Control de asientos por viaje.
- Boleto imprimible.
- Reportes de ventas por rango de fechas.

## Modelo de dominio

El sistema separa conceptos que en una version anterior estaban mezclados:

- Autobus: vehiculo fisico.
- Ruta: origen, destino, precio base y duracion estimada.
- Viaje: salida especifica en una fecha y hora, usando una ruta y un autobus.
- Boleto: venta de un asiento para un viaje.

Para conservar historial operativo, el sistema usa cambios de estado en lugar de eliminacion fisica: usuarios, autobuses y rutas se desactivan; los viajes y boletos se cancelan.

## Credenciales demo

```text
Correo: admin@example.com
Password: password123
Rol: TERMINAL_MANAGER
```

## Configuracion local

### Backend

Ruta:

```text
mayitobus-api/
```

Crear una base de datos PostgreSQL:

```sql
CREATE DATABASE mayitobus_db;
```

Configurar variables de entorno:

```text
DB_URL=jdbc:postgresql://localhost:5432/mayitobus_db
DB_USERNAME=postgres
DB_PASSWORD=tu_password_de_postgres
JWT_SECRET=una_clave_larga_para_desarrollo_local
JWT_EXPIRATION_MINUTES=120
```

Tambien puedes revisar el archivo de ejemplo:

```text
mayitobus-api/src/main/resources/application-example.properties
```

Para desarrollo local, puedes copiar ese ejemplo como `application-local.properties`. Ese archivo esta ignorado por Git para no subir contrasenas ni claves privadas.

Ejecutar desde IntelliJ IDEA:

```text
Run MayitobusApiApplication
```

O desde terminal:

```bash
cd mayitobus-api
./mvnw spring-boot:run
```

Health check:

```http
GET http://localhost:8080/api/health
```

### Frontend

Ruta:

```text
mayitobus-web/
```

Configurar variable de entorno opcional:

```text
VITE_API_URL=http://localhost:8080
```

Existe un archivo de ejemplo:

```text
mayitobus-web/.env.example
```

Instalar dependencias y ejecutar:

```bash
cd mayitobus-web
npm install
npm run dev
```

URL local:

```text
http://127.0.0.1:5173
```

## Docker

El proyecto incluye una configuracion Docker para levantar PostgreSQL, la API y el frontend con un solo comando.

Crear un archivo `.env` a partir del ejemplo:

```bash
copy .env.example .env
```

Levantar los servicios:

```bash
docker compose up --build
```

URLs:

```text
Frontend: http://localhost:5173
Backend:  http://localhost:8080
Postgres: localhost:5433
```

Para abrir el frontend desde otro dispositivo en la misma red, usa la IP local de tu computadora:

```text
http://TU_IP_LOCAL:5173
```

En Docker, el frontend usa el proxy de Nginx para enviar las llamadas `/api` al backend, por eso tambien funciona desde celular sin cambiar `localhost` en el navegador.

Detener los servicios:

```bash
docker compose down
```

Detener y borrar los datos de PostgreSQL del contenedor:

```bash
docker compose down -v
```

## Endpoints principales

```http
POST /api/auth/login

GET  /api/buses
POST /api/buses
PATCH /api/buses/{id}/deactivate
PATCH /api/buses/{id}/activate

GET  /api/routes
POST /api/routes
PATCH /api/routes/{id}/deactivate
PATCH /api/routes/{id}/activate

GET  /api/trips
POST /api/trips
PATCH /api/trips/{id}/cancel
GET  /api/trips/{id}/seats

GET  /api/tickets
POST /api/tickets
PATCH /api/tickets/{id}/cancel

GET  /api/users
POST /api/users
PATCH /api/users/{id}/deactivate
PATCH /api/users/{id}/activate

GET  /api/reports/sales?from=2026-06-12&to=2026-06-12
```

## Verificacion

Comandos recomendados antes de subir cambios:

```bash
cd mayitobus-api
./mvnw test
```

```bash
cd mayitobus-web
npm run lint
npm run build
```

## Estado

Proyecto en desarrollo para portafolio. El flujo principal ya permite administrar catalogos, programar viajes, vender boletos con descuentos, controlar asientos, imprimir comprobantes y consultar reportes.
