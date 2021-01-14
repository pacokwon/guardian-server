import { Pool, OkPacket, ResultSetHeader } from 'mysql2/promise';
import { getPool } from '@/common/db';
import { SQLRow } from '@/common/type';
import { User } from '@/model/User';

type UserModifiableFields = Omit<Partial<User>, 'id'>;

export interface FindAllOptions {
    field?: string[];
    page?: number;
    pageSize?: number;
}

export interface FindOneOptions {
    field?: string[];
}

export class UserRepository {
    pool: Pool;

    constructor() {
        this.pool = getPool();
    }

    async findAll(options: FindAllOptions = {}): Promise<User[]> {
        const { field = ['id', 'nickname'] } = options;
        const selectedColumns = field.join(', ');

        const { page = 1, pageSize = 10 } = options;
        const limit = Math.min(pageSize, 100);
        const offset = (page - 1) * pageSize;

        const [rows] = await this.pool.query<SQLRow<User>[]>(`
            SELECT ${selectedColumns}
            FROM User
            WHERE deleted=0
            LIMIT ${limit}
            OFFSET ${offset}
        `);

        return rows;
    }

    async findOne(
        id: number,
        options: FindOneOptions = {}
    ): Promise<User | undefined> {
        const { field = ['id', 'nickname'] } = options;
        const selectedColumns = field.join(', ');

        const [rows] = await this.pool.query<SQLRow<User>[]>(
            `SELECT ${selectedColumns} FROM User WHERE id='${id}' AND deleted=0`
        );

        return rows[0];
    }

    async insertOne(nickname: string): Promise<number> {
        const [result] = await this.pool.query<ResultSetHeader>(
            `INSERT INTO User (nickname) VALUES ('${nickname}')`
        );

        return result.affectedRows;
    }

    async updateOne(id: number, fields: UserModifiableFields): Promise<number> {
        // implementation is incomplete since it does not support numerical types
        // it is left as is since the only modifiable field as of now is the nickname
        const columnValueMapping = Object.entries(fields)
            .map(([key, value]) => `${key}='${value}'`)
            .join(', ');

        const [result] = await this.pool.query<OkPacket>(
            `UPDATE User SET ${columnValueMapping} WHERE id='${id}' AND deleted=0`
        );

        return result.changedRows;
    }

    async removeOne(id: number): Promise<number> {
        const [result] = await this.pool.query<OkPacket>(
            `UPDATE User SET deleted=1 WHERE id='${id}' AND deleted=0`
        );

        return result.changedRows;
    }
}
