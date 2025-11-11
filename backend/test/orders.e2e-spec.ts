import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "../src/app.module";

describe("Orders (e2e)", () => {
  let app: INestApplication;
  let accessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      })
    );
    await app.init();

    // Register and login to get access token
    await request(app.getHttpServer())
      .post("/api/auth/register")
      .send({
        email: "orders-test@example.com",
        password: "password123",
        firstName: "Orders",
        lastName: "Test",
        role: "client",
      });

    const loginRes = await request(app.getHttpServer())
      .post("/api/auth/login")
      .send({
        email: "orders-test@example.com",
        password: "password123",
      });

    accessToken = loginRes.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe("/api/orders (POST)", () => {
    it("should create a new order", () => {
      return request(app.getHttpServer())
        .post("/api/orders")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          clientId: "client-1",
          totalAmount: 5000,
          description: "Test order",
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty("id");
          expect(res.body.totalAmount).toBe(5000);
        });
    });

    it("should return 401 without authentication", () => {
      return request(app.getHttpServer())
        .post("/api/orders")
        .send({
          clientId: "client-1",
          totalAmount: 5000,
        })
        .expect(401);
    });
  });

  describe("/api/orders (GET)", () => {
    it("should return list of orders", () => {
      return request(app.getHttpServer())
        .get("/api/orders")
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });
});

