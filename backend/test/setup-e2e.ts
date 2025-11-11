// E2E test setup
import { ConfigModule } from "@nestjs/config";

// Mock environment variables for E2E tests
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-secret-key";
process.env.JWT_REFRESH_SECRET = "test-refresh-secret-key";
process.env.DB_HOST = "localhost";
process.env.DB_PORT = "5432";
process.env.DB_USERNAME = "test";
process.env.DB_PASSWORD = "test";
process.env.DB_NAME = "masterprofi_test";
process.env.PORT = "3001"; // Different port for E2E tests
process.env.FRONTEND_URL = "http://localhost:5173";

// Increase timeout for E2E tests
jest.setTimeout(30000);

