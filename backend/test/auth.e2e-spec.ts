import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "../src/app.module";
import { DataSource } from "typeorm";

describe("Auth (e2e)", () => {
  let app: INestApplication;
  let dataSource: DataSource;

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

    dataSource = moduleFixture.get<DataSource>(DataSource);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Clean database before each test
    // В реальном проекте используйте тестовую БД
    // await dataSource.synchronize(true);
  });

  describe("/api/auth/register (POST)", () => {
    it("should register a new user", () => {
      return request(app.getHttpServer())
        .post("/api/auth/register")
        .send({
          email: "test@example.com",
          password: "password123",
          firstName: "Test",
          lastName: "User",
          role: "client",
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty("access_token");
          expect(res.body).toHaveProperty("refresh_token");
        });
    });

    it("should return 400 when email is missing", () => {
      return request(app.getHttpServer())
        .post("/api/auth/register")
        .send({
          password: "password123",
          firstName: "Test",
          lastName: "User",
        })
        .expect(400);
    });

    it("should return 409 when user already exists", async () => {
      // First registration
      await request(app.getHttpServer())
        .post("/api/auth/register")
        .send({
          email: "existing@example.com",
          password: "password123",
          firstName: "Existing",
          lastName: "User",
          role: "client",
        });

      // Try to register again with same email
      return request(app.getHttpServer())
        .post("/api/auth/register")
        .send({
          email: "existing@example.com",
          password: "password123",
          firstName: "Existing",
          lastName: "User",
          role: "client",
        })
        .expect(409);
    });
  });

  describe("/api/auth/login (POST)", () => {
    it("should login with valid credentials", async () => {
      // Register user first
      await request(app.getHttpServer())
        .post("/api/auth/register")
        .send({
          email: "login@example.com",
          password: "password123",
          firstName: "Login",
          lastName: "User",
          role: "client",
        });

      // Login
      return request(app.getHttpServer())
        .post("/api/auth/login")
        .send({
          email: "login@example.com",
          password: "password123",
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty("access_token");
          expect(res.body).toHaveProperty("refresh_token");
        });
    });

    it("should return 401 with invalid credentials", () => {
      return request(app.getHttpServer())
        .post("/api/auth/login")
        .send({
          email: "invalid@example.com",
          password: "wrongpassword",
        })
        .expect(401);
    });
  });

  describe("/api/auth/refresh (POST)", () => {
    it("should refresh tokens with valid refresh token", async () => {
      // Register and login to get tokens
      const registerRes = await request(app.getHttpServer())
        .post("/api/auth/register")
        .send({
          email: "refresh@example.com",
          password: "password123",
          firstName: "Refresh",
          lastName: "User",
          role: "client",
        });

      const refreshToken = registerRes.body.refresh_token;

      return request(app.getHttpServer())
        .post("/api/auth/refresh")
        .send({ refresh_token: refreshToken })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty("access_token");
          expect(res.body).toHaveProperty("refresh_token");
        });
    });

    it("should return 401 with invalid refresh token", () => {
      return request(app.getHttpServer())
        .post("/api/auth/refresh")
        .send({ refresh_token: "invalid-token" })
        .expect(401);
    });
  });
});

