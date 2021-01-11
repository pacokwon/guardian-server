import { Pool } from 'mysql2/promise';
import { getPool } from '@/common/db';
import { PetRow, Pet } from '@/model/Pet';

export type PetModifiableFields = Omit<Partial<Pet>, 'id'>;
export type PetCreationFields = Pick<
    Pet,
    'species' | 'nickname' | 'imageUrl'
> & {
    [index: string]: string;
};

export class PetRepository {
    pool: Pool;

    constructor() {
        this.pool = getPool();
    }

    async findAll(
        select: string[] = ['id', 'nickname', 'species', 'imageUrl']
    ): Promise<Pet[]> {
        const selectedColumns = select.join(', ');

        const [rows] = await this.pool.query<PetRow[]>(
            `SELECT ${selectedColumns} FROM Pet WHERE deleted=0`
        );

        return rows;
    }

    async findOne(
        id: number,
        select: string[] = ['id', 'nickname', 'species', 'imageUrl']
    ): Promise<Pet | undefined> {
        const selectedColumns = select.join(', ');

        const [rows] = await this.pool.query<PetRow[]>(
            `SELECT ${selectedColumns} FROM Pet WHERE id='${id}' AND deleted=0`
        );

        return rows[0];
    }

    async insertOne(fields: PetCreationFields): Promise<void> {
        const columnsList = Object.keys(fields);
        const valuesList = columnsList.map(column => `'${fields[column]}'`);

        const columns = columnsList.join(', ');
        const values = valuesList.join(', ');

        await this.pool.query<PetRow[]>(
            `INSERT INTO Pet (${columns}) VALUES (${values})`
        );
    }

    async updateOne(id: number, fields: PetModifiableFields): Promise<void> {
        const columnValueMapping = Object.entries(fields)
            .map(([key, value]) => `${key}='${value}'`)
            .join(', ');

        await this.pool.query<PetRow[]>(
            `UPDATE Pet SET ${columnValueMapping} WHERE id='${id}' AND deleted=0`
        );
    }

    async removeOne(id: number): Promise<void> {
        await this.pool.query<PetRow[]>(
            `UPDATE Pet SET deleted=1 WHERE id='${id}' AND deleted=0`
        );
    }
}
