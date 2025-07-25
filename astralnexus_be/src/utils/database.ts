import { Pool, QueryResult } from "pg";
import { db } from "../config/database";

/**
 * Execute a SQL query with parameters
 */
export const query = async (
  text: string,
  params?: any[]
): Promise<QueryResult> => {
  const client = await db.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } catch (error) {
    console.error("Database query error:", error);
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Execute a transaction with multiple queries
 */
export const transaction = async (
  queries: Array<{ text: string; params?: any[] }>
) => {
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    const results = [];

    for (const q of queries) {
      const result = await client.query(q.text, q.params);
      results.push(result);
    }

    await client.query("COMMIT");
    return results;
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Transaction error:", error);
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Get a single row from query result
 */
export const queryOne = async (text: string, params?: any[]) => {
  const result = await query(text, params);
  return result.rows[0] || null;
};

/**
 * Get all rows from query result
 */
export const queryAll = async (text: string, params?: any[]) => {
  const result = await query(text, params);
  return result.rows;
};

/**
 * Check if a record exists
 */
export const exists = async (
  table: string,
  condition: string,
  params?: any[]
): Promise<boolean> => {
  const result = await query(
    `SELECT EXISTS(SELECT 1 FROM ${table} WHERE ${condition})`,
    params
  );
  return result.rows[0].exists;
};

/**
 * Get total count of records
 */
export const count = async (
  table: string,
  condition?: string,
  params?: any[]
): Promise<number> => {
  const whereClause = condition ? `WHERE ${condition}` : "";
  const result = await query(
    `SELECT COUNT(*) FROM ${table} ${whereClause}`,
    params
  );
  return parseInt(result.rows[0].count);
};
