import pool from 'pg';
import dotenv from 'dotenv';


const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});


pool.on('connect', () => {
    console.log('postgres databse connected successfully');
});

pool.on('error', (err) => {
    console.error(err);
    process.exit(1);
});

export default pool;