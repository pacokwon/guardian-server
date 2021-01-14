import { Pool, OkPacket, ResultSetHeader } from 'mysql2/promise';
import { getPool } from '@/common/db';
import { SQLRow } from '@/common/type';
import { User } from '@/model/User';

type UserModifiableFields = Omit<Partial<User>, 'id'>;

export class UserRepository {
    pool: Pool;

    constructor() {
        this.pool = getPool();
    }

    async findAll(select: string[] = ['id', 'nickname']): Promise<User[]> {
        const selectedColumns = select.join(', ');

        const [rows] = await this.pool.query<SQLRow<User>[]>(
            `SELECT ${selectedColumns} FROM User WHERE deleted=0`
        );

        return rows;
    }

    async findOne(
        id: number,
        select: string[] = ['id', 'nickname']
    ): Promise<User | undefined> {
        const selectedColumns = select.join(', ');

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

    async updateOne(id: number, fields: UserModifiableFields): Promise<void> {
        // implementation is incomplete since it does not support numerical types
        // it is left as is since the only modifiable field as of now is the nickname
        const columnValueMapping = Object.entries(fields)
            .map(([key, value]) => `${key}='${value}'`)
            .join(', ');

        await this.pool.query(
            `UPDATE User SET ${columnValueMapping} WHERE id='${id}' AND deleted=0`
        );
    }

    async removeOne(id: number): Promise<number> {
        const [result] = await this.pool.query<OkPacket>(
            `UPDATE User SET deleted=1 WHERE id='${id}' AND deleted=0`
        );

        return result.changedRows;
    }
}
