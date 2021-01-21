import { Pool, OkPacket, ResultSetHeader } from 'mysql2/promise';
import { getPool } from '../common/db';
import { SQLRow } from '../common/type';
import { ApiError, Summary } from '../common/error';
import { User } from '../model/User';

type UserModifiableFields = Omit<Partial<User>, 'id'>;

export interface UserFindAllOptions {
    field?: string[];
    page?: number;
    pageSize?: number;
    after?: number;
}

export interface UserFindOneOptions {
    field?: string[];
}

export class UserRepository {
    pool: Pool;

    constructor() {
        this.pool = getPool();
    }

    async findAll(options: UserFindAllOptions): Promise<User[]> {
        const {
            field = ['id', 'nickname'],
            page = 1,
            pageSize = 10,
            after
        } = options;
        const limit = Math.min(pageSize, 100);

        // prioritize `after` option over `page`
        const offset = after !== undefined ? after + 1 : (page - 1) * pageSize;

        const [rows] = await this.pool.query<SQLRow<User>[]>(
            `
            SELECT ?? FROM User
            WHERE deleted=0
            LIMIT ?
            OFFSET ?
        `,
            [field, limit, offset]
        );

        return rows;
        // return { users: rows, limit };
    }

    async findOne(
        id: number,
        options: UserFindOneOptions
    ): Promise<User | undefined> {
        const { field = ['id', 'nickname'] } = options;
        const [rows] = await this.pool.query<SQLRow<User>[]>(
            `SELECT ?? FROM User WHERE id=? AND deleted=0`,
            [field, id]
        );

        return rows.length === 0 ? undefined : rows[0];
    }

    async insertOne(nickname: string): Promise<number | null> {
        const [result] = await this.pool.query<ResultSetHeader>(
            `INSERT INTO User (nickname) VALUES (?)`,
            [nickname]
        );

        return result.insertId || null;
    }

    async updateOne(id: number, fields: UserModifiableFields): Promise<void> {
        // implementation is incomplete since it does not support numerical types
        // it is left as is since the only modifiable field as of now is the nickname
        const [{ changedRows }] = await this.pool.query<OkPacket>(
            `UPDATE User SET ? WHERE id=?`,
            [fields, id]
        );

        if (changedRows === 0)
            throw new ApiError(Summary.NotFound, 'User not found');
        else if (changedRows > 1)
            throw new ApiError(
                Summary.InternalServerError,
                'Multiple rows have been updated'
            );
    }

    async removeOne(id: number): Promise<void> {
        const [result] = await this.pool.query<OkPacket>(
            `UPDATE User SET deleted=1 WHERE id=?`,
            [id]
        );

        const deletedRowsCount = result.changedRows;
        if (deletedRowsCount === 0)
            throw new ApiError(Summary.NotFound, 'User not found');
        else if (deletedRowsCount > 1)
            throw new ApiError(
                Summary.InternalServerError,
                'Multiple rows deleted'
            );
    }
}
