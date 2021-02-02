import 'dotenv/config';
import { createPool, Pool } from 'mysql2/promise';

const pool = createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.NODE_ENV === 'test' ? 'GuardianTest' : 'Guardian'
});

export const getPool = (): Pool => pool;
