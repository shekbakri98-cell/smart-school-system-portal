import mysql from 'mysql2/promise';

let pool;

export async function connectToDatabase() {
  if (!pool) {
    // Build out configuration parameters with reliable local fallbacks
    const poolConfig = {
      host: process.env.DB_HOST || 'mysql-anewar.alwaysdata.net',
      user: process.env.DB_USER || 'anewar',
      password: process.env.DB_PASSWORD, // Loaded from Render Environment Variables panel
      database: process.env.DB_NAME || 'anewar_smart_school_db',
      port: parseInt(process.env.DB_PORT || '3306'),
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    };

    // Safely apply production SSL rules only if requested or required by host infrastructure
    if (process.env.NODE_ENV === 'production' && process.env.DB_SSL === 'true') {
      poolConfig.ssl = { rejectUnauthorized: false };
    }

    pool = mysql.createPool(poolConfig);
  }
  return pool;
}
