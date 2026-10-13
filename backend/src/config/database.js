import mysql from 'mysql2/promise';
import { env } from './env.js';

let pool = null;

export const getPool = () => {
  if (!pool) {
    pool = mysql.createPool({
      host: env.DB_HOST,
      port: env.DB_PORT,
      user: env.DB_USER,
      password: env.DB_PASSWORD,
      database: env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 15,
      queueLimit: 0,
      decimalNumbers: true,
      timezone: 'Z'
    });
  }
  return pool;
};

/**
 * Execute parameterized query
 */
export const query = async (sql, params = []) => {
  const p = getPool();
  const [rows] = await p.execute(sql, params);
  return rows;
};

/**
 * Run callback within a managed database transaction
 */
export const withTransaction = async (callback) => {
  const p = getPool();
  const connection = await p.getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
};

/**
 * Check if the database connection is healthy without leaking credentials
 */
export const checkDatabaseReadiness = async () => {
  try {
    const p = getPool();
    const connection = await p.getConnection();
    await connection.ping();
    connection.release();
    return { isConnected: true, message: 'Database connected and responsive' };
  } catch (err) {
    return {
      isConnected: false,
      message: 'Database connection currently unavailable: ' + (err.code || err.message)
    };
  }
};
