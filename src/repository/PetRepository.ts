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

// export class UserRepository {
//     pool: Pool;

//     constructor() {
//         this.pool = getPool();
//     }

//     async findAll(select: string[] = ['id', 'nickname']): Promise<User[]> {
//         const selectedColumns = select.join(', ');

//         const [rows] = await this.pool.query<UserRow[]>(
//             `SELECT ${selectedColumns} FROM User WHERE deleted=0`
//         );

//         return rows;
//     }

//     async findOne(
//         id: number,
//         select: string[] = ['id', 'nickname']
//     ): Promise<User | undefined> {
//         const selectedColumns = select.join(', ');

//         const [rows] = await this.pool.query<UserRow[]>(
//             `SELECT ${selectedColumns} FROM User WHERE id='${id}' AND deleted=0`
//         );

//         return rows[0];
//     }

//     async insertOne(nickname: string): Promise<void> {
//         await this.pool.query<UserRow[]>(
//             `INSERT INTO User (nickname) VALUES ('${nickname}')`
//         );
//     }

//     async updateOne(id: number, fields: ModifiableUserFields): Promise<void> {
//         // implementation is incomplete since it does not support numerical types
//         // it is left as is since the only modifiable field as of now is the nickname
//         const columnValueMapping = Object.entries(fields)
//             .map(([key, value]) => `${key}='${value}'`)
//             .join(', ');

//         await this.pool
//             .query<UserRow[]>(
//                 `UPDATE User SET ${columnValueMapping} WHERE id='${id}' AND deleted=0`
//             )
//             .catch(error => {
//                 throw Error(error);
//             });
//     }

//     async removeOne(id: number): Promise<void> {
//         await this.pool
//             .query<UserRow[]>(
//                 `UPDATE User SET deleted=1 WHERE id='${id}' AND deleted=0`
//             )
//             .catch(error => {
//                 throw Error(error);
//             });
//     }
// }
