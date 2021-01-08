import { Pool } from 'mysql2/promise';
import { getPool } from '@/common/db';
import { UserRow, User } from '@/model/User';

export class UserRepository {
    pool: Pool;

    constructor() {
        this.pool = getPool();
    }

    async findAll(select: string[] = ['id', 'nickname']): Promise<User[]> {
        const selectedColumns = select.join(', ');

        const [rows] = await this.pool.query<UserRow[]>(
            `SELECT ${selectedColumns} FROM User WHERE deleted=0`
        );

        return rows;
    }

    async findOne(
        id: number,
        select: string[] = ['id', 'nickname']
    ): Promise<User | undefined> {
        const selectedColumns = select.join(', ');

        const [rows] = await this.pool.query<UserRow[]>(
            `SELECT ${selectedColumns} FROM User WHERE id='${id}' AND deleted=0`
        );

        return rows[0];
    }

    async insertOne(nickname: string): Promise<void> {
        const [_, error] = await this.pool.query<UserRow[]>(
            `INSERT INTO User (nickname) VALUES ('${nickname}')`
        );
    }

    async updateOne(id: number, nickname: string): Promise<boolean> {
        const [_, error] = await this.pool.query<UserRow[]>(
            `UPDATE User SET nickname='${nickname}' WHERE id='${id}' AND deleted=0`
        );

        if (error) console.log(error);

        return error ? false : true;
    }

    async removeOne(id: number): Promise<boolean> {
        const [_, error] = await this.pool.query<UserRow[]>(
            `UPDATE User SET deleted=1 WHERE id='${id}' AND deleted=0`
        );

        if (error) console.log(error);

        return error ? false : true;
    }
}
