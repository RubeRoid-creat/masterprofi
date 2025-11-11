// Global test setup
import { ConfigModule } from "@nestjs/config";

// Mock environment variables
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-secret-key";
process.env.JWT_REFRESH_SECRET = "test-refresh-secret-key";
process.env.DB_HOST = "localhost";
process.env.DB_PORT = "5432";
process.env.DB_USERNAME = "test";
process.env.DB_PASSWORD = "test";
process.env.DB_NAME = "masterprofi_test";

// Increase timeout for async operations
jest.setTimeout(10000);

