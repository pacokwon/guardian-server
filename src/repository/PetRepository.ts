import { Pool, OkPacket, ResultSetHeader } from 'mysql2/promise';
import { getPool } from '../common/db';
import { SQLRow } from '../common/type';
import { ApiError, Summary } from '../common/error';
import { Pet } from '../model/Pet';

export type PetModifiableFields = Omit<Pet, 'id'>;
export type PetCreationFields = Pick<
    Pet,
    'species' | 'nickname' | 'imageUrl'
> & {
    [index: string]: string;
};

export interface PetFindAllOptions {
    field?: string[];
    page?: number;
    pageSize?: number;
    after?: number;
}

export interface PetFindOneOptions {
    field?: string[];
}

export class PetRepository {
    pool: Pool;

    constructor() {
        this.pool = getPool();
    }

    async findAll(options: PetFindAllOptions): Promise<Pet[]> {
        const { field = ['id', 'nickname', 'species', 'imageUrl'] } = options;

        const { page = 1, pageSize = 10, after } = options;
        const limit = Math.min(pageSize, 100);

        if (after === undefined) {
            const offset = (page - 1) * pageSize;
            const [rows] = await this.pool.query<SQLRow<Pet>[]>(
                `
                SELECT ?? FROM Pet
                WHERE deleted=0
                LIMIT ?
                OFFSET ?
            `,
                [field, limit, offset]
            );

            return rows;
        } else {
            // use cursor
            const [rows] = await this.pool.query<SQLRow<Pet>[]>(
                `
                SELECT ?? FROM Pet
                WHERE deleted=0 AND id > ?
                ORDER BY id
                LIMIT ?
            `,
                [field, after, limit]
            );

            return rows;
        }
    }

    async findOne(
        id: number,
        options: PetFindOneOptions
    ): Promise<Pet | undefined> {
        const { field = ['id', 'nickname', 'species', 'imageUrl'] } = options;

        const [rows] = await this.pool.query<SQLRow<Pet>[]>(
            `SELECT ?? FROM Pet WHERE id=? AND deleted=0`,
            [field, id]
        );

        return rows.length === 0 ? undefined : rows[0];
    }

    async insertOne(fields: PetCreationFields): Promise<number | null> {
        const columns = Object.keys(fields);
        const values = columns.map(column => fields[column]);

        const [result] = await this.pool.query<ResultSetHeader>(
            `INSERT INTO Pet (??) VALUES (?)`,
            [columns, values]
        );

        return result.insertId || null;
    }

    async updateOne(id: number, fields: PetModifiableFields): Promise<void> {
        const [{ changedRows }] = await this.pool.query<OkPacket>(
            `UPDATE Pet SET ? WHERE id=?`,
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
            `UPDATE Pet SET deleted=1 WHERE id=?`,
            [id]
        );

        const deletedRowsCount = result.changedRows;
        if (deletedRowsCount === 0)
            throw new ApiError(Summary.NotFound, 'Pet not found');
        else if (deletedRowsCount > 1)
            throw new ApiError(
                Summary.InternalServerError,
                'Multiple rows have been deleted'
            );
    }
}
