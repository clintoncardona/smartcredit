import request from "supertest";
import { describe, expect, test } from "vitest";
import app from "../src/app.js";

describe("API REST SmartCredit — Pruebas Funcionales y de Seguridad (Black Box)", () => {
  test("1. GET /api/health responde 200 OK con estado operativo del servicio", async () => {
    const res = await request(app).get("/api/health");

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(res.body.servicio).toBe("SmartCredit API · Banco Andino");
    expect(res.body.timestamp).toBeDefined();
  });

  test("2. POST /api/auth/login rechaza con 400 cuando faltan credenciales obligatorias", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ correo: "usuario@correo.com" });

    expect(res.status).toBe(400);
    expect(res.body.mensaje).toBeDefined();
  });

  test("3. POST /api/solicitudes bloquea con 401 el acceso sin token JWT", async () => {
    const res = await request(app)
      .post("/api/solicitudes")
      .send({ montoSolicitado: 10000000, plazoMeses: 24 });

    expect(res.status).toBe(401);
  });

  test("4. Bloquea peticiones provenientes de orígenes no autorizados por CORS", async () => {
    const res = await request(app)
      .get("/api/health")
      .set("Origin", "https://dominio-no-autorizado.example.com");

    expect(res.status).toBe(500);
    expect(res.body.mensaje).toBe("Error interno del servidor.");
  });

  test("5. Devuelve 404 ante rutas inexistentes de la API", async () => {
    const res = await request(app).get("/api/endpoint-inexistente");

    expect(res.status).toBe(404);
  });
});
