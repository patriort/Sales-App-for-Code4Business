# App Full Stack de Ventas

Stack usado:
- Backend: Node.js + Express
- Frontend: Next.js
- Base de datos: SQLite
- Orquestación: Docker Compose

## Funcionalidad
- Crear ventas (cliente, producto, monto)
- Listar ventas
- Evaluar venta con score de 1 a 5

## Ejecutar
1. Construir e iniciar:
   ```bash
   docker compose up --build
   ```
2. Abrir frontend: `http://localhost:3000`
3. API backend: `http://localhost:4000`

## Endpoints
- `GET /health`
- `GET /sales`
- `POST /sales`
  - body:
    ```json
    {
      "customer": "Acme",
      "product": "Suscripción",
      "amount": 1250
    }
    ```
- `PATCH /sales/:id/score`
  - body:
    ```json
    {
      "score": 4
    }
    ```
