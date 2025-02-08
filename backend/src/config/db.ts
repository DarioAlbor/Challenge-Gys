import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';

const envPath = process.env.NODE_ENV === 'production' 
  ? path.join(process.cwd(), 'dist', '.env')
  : path.join(process.cwd(), '.env');

dotenv.config({ path: envPath });

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD || '',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: true
});

export default pool;