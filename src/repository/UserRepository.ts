import { Pool } from 'mysql2/promise';
import { getPool } from '@/common/db';
import { UserRow, User } from '@/model/User';

type UserModifiableFields = Omit<Partial<User>, 'id'>;

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
        await this.pool.query<UserRow[]>(
            `INSERT INTO User (nickname) VALUES ('${nickname}')`
        );
    }

    async updateOne(id: number, fields: UserModifiableFields): Promise<void> {
        // implementation is incomplete since it does not support numerical types
        // it is left as is since the only modifiable field as of now is the nickname
        const columnValueMapping = Object.entries(fields)
            .map(([key, value]) => `${key}='${value}'`)
            .join(', ');

        await this.pool.query<UserRow[]>(
            `UPDATE User SET ${columnValueMapping} WHERE id='${id}' AND deleted=0`
        );
    }

    async removeOne(id: number): Promise<void> {
        await this.pool.query<UserRow[]>(
            `UPDATE User SET deleted=1 WHERE id='${id}' AND deleted=0`
        );
    }
}
