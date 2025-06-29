// Database configuration
export const databaseConfig = {
  // Add your database configuration here
  // For example, MongoDB, PostgreSQL, SQLite, etc.
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || "elysian_db",
  username: process.env.DB_USER || "admin",
  password: process.env.DB_PASSWORD || "password",
};
