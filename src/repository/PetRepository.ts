import { Pool, RowDataPacket, OkPacket, ResultSetHeader } from 'mysql2/promise';
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

export class PetRepository {
    pool: Pool;

    constructor() {
        this.pool = getPool();
    }

    async findAll(
        select: string[] = ['id', 'nickname', 'species', 'imageUrl']
    ): Promise<Pet[]> {
        const selectedColumns = select.join(', ');

        const [rows] = await this.pool.query<SQLRow<Pet>[]>(
            `SELECT ${selectedColumns} FROM Pet WHERE deleted=0`
        );

        return rows;
    }

    async findOne(
        id: number,
        select: string[] = ['id', 'nickname', 'species', 'imageUrl']
    ): Promise<Pet | undefined> {
        const selectedColumns = select.join(', ');

        const [rows] = await this.pool.query<SQLRow<Pet>[]>(
            `SELECT ${selectedColumns} FROM Pet WHERE id='${id}' AND deleted=0`
        );

        return rows[0];
    }

    async insertOne(fields: PetCreationFields): Promise<number> {
        const columnsList = Object.keys(fields);
        const valuesList = columnsList.map(column => `'${fields[column]}'`);

        const columns = columnsList.join(', ');
        const values = valuesList.join(', ');

        const [result] = await this.pool.query<ResultSetHeader>(
            `INSERT INTO Pet (${columns}) VALUES (${values})`
        );

        return result.affectedRows;
    }

    async updateOne(id: number, fields: PetModifiableFields): Promise<void> {
        const columnValueMapping = Object.entries(fields)
            .map(([key, value]) => `${key}='${value}'`)
            .join(', ');

        await this.pool.query(
            `UPDATE Pet SET ${columnValueMapping} WHERE id='${id}' AND deleted=0`
        );
    }

    async removeOne(id: number): Promise<number> {
        const [result] = await this.pool.query<OkPacket>(
            `UPDATE Pet SET deleted=1 WHERE id='${id}' AND deleted=0`
        );

        return result.changedRows;
    }

    async insertUserRegistration(petID: number, userID: number): Promise<void> {
        await this.pool.query(
            `INSERT INTO UserPetHistory (userID, petID) VALUES (${userID}, ${petID})`
        );
    }

    async removeUserRegistrationAndGetChangedRows(
        petID: number,
        userID: number
    ): Promise<number> {
        const [result] = await this.pool.query<OkPacket>(`
            UPDATE UserPetHistory
                SET released=1
                WHERE petID=${petID}
                AND userID=${userID}
                AND released=0
        `);

        return result.changedRows;
    }

    async isPetRegistered(petID: number): Promise<boolean> {
        const [rows] = await this.pool.query<RowDataPacket[]>(
            `SELECT id from UserPetHistory WHERE petID=${petID} AND released=0`
        );

        // if `rows` has an entry, it is registered
        return rows.length !== 0;
    }
}
