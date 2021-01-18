import { Pool, OkPacket, ResultSetHeader } from 'mysql2/promise';
import { getPool } from '@/common/db';
import { SQLRow } from '@/common/type';
import { Pet } from '@/model/Pet';

export type PetModifiableFields = Omit<Pet, 'id'>;
export type PetCreationFields = Pick<
    Pet,
    'species' | 'nickname' | 'imageUrl'
> & {
    [index: string]: string;
};

export interface PetFindAllOptions {
    field?: (keyof Pet)[];
    page?: number;
    pageSize?: number;
}

export interface PetFindOneOptions {
    field?: (keyof Pet)[];
}

export class PetRepository {
    pool: Pool;

    constructor() {
        this.pool = getPool();
    }

    async findAll(options: PetFindAllOptions = {}): Promise<Pet[]> {
        const { field = ['id', 'nickname', 'species', 'imageUrl'] } = options;

        const { page = 1, pageSize = 10 } = options;
        const limit = Math.min(pageSize, 100);
        const offset = (page - 1) * pageSize;

        const [rows] = await this.pool.query<SQLRow<Pet>[]>(
            `
            SELECT ??
            FROM Pet
            WHERE deleted=0
            LIMIT ?
            OFFSET ?
        `,
            [field, limit, offset]
        );

        return rows;
    }

    async findOne(
        id: number,
        options: PetFindOneOptions = {}
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
        await this.pool.query(`UPDATE Pet SET ? WHERE id=? AND deleted=0`, [
            fields,
            id
        ]);
    }

    async removeOne(id: number): Promise<number> {
        const [result] = await this.pool.query<OkPacket>(
            `UPDATE Pet SET deleted=1 WHERE id=? AND deleted=0`,
            [id]
        );

        return result.changedRows;
    }
}
