// Database configuration
export const databaseConfig = {
  // Add your database configuration here
  // For example, MongoDB, PostgreSQL, SQLite, etc.
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
};
