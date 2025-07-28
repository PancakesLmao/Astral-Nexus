import { Pool } from "pg";

// Parse DATABASE_URL or use individual environment variables
const getDatabaseConfig = () => {
  if (process.env.DATABASE_URL) {
    // Parse DATABASE_URL format: postgresql://user:password@host:port/database
    const url = new URL(process.env.DATABASE_URL);
    return {
      host: url.hostname,
      port: parseInt(url.port) || 5432,
      database: url.pathname.slice(1), // Remove leading slash
      user: url.username,
      password: url.password,
    };
  }

  // Fallback to individual environment variables
  return {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || "5432"),
    database: process.env.DB_NAME || process.env.POSTGRES_DB,
    user: process.env.DB_USER || process.env.POSTGRES_USER,
    password: process.env.DB_PASSWORD || process.env.POSTGRES_PASSWORD,
  };
};

// Database configuration from environment variables
export const databaseConfig = {
  ...getDatabaseConfig(),
  max: 10, // Max number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000,
  // Return an error after 2 seconds if connection could not be established
};

// Create PostgreSQL connection pool
export const db = new Pool(databaseConfig);

// Handle pool errors
db.on("error", (err, client) => {
  console.error("Unexpected error on idle client", err);
});

// Test database connection
export const testConnection = async () => {
  try {
    const client = await db.connect();
    console.log("Database connected successfully");
    const result = await client.query("SELECT NOW() as current_time");
    console.log("Database time:", result.rows[0].current_time);
    client.release();
    return true;
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("❌ Database connection failed:", errorMessage);
    if (process.env.NODE_ENV === "development") {
      console.log(
        "Note: Make sure PostgreSQL is running or start Docker services"
      );
    }
    return false;
  }
};

// Close database connection
export const closeConnection = async () => {
  await db.end();
};
