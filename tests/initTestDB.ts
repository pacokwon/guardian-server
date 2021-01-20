import 'dotenv/config';
import path from 'path';
import fs from 'fs';
import { createConnection } from 'mysql2/promise';

const initTestDB = async () => {
    const file = (
        await fs.promises.readFile(path.resolve(__dirname, '../setup/init.sql'))
    )
        .toString()
        .replace(/Guardian/g, 'GuardianTest');

    const connection = await createConnection({
        host: 'localhost',
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        multipleStatements: true
    });

    await connection.query(file);
    await connection.end();
};

initTestDB();
