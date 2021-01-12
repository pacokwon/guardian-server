import { Pool, OkPacket } from 'mysql2/promise';
import { getPool } from '@/common/db';
import { UserPetHistory, UserPetHistoryRow } from '@/model/UserPetHistory';

interface FindQuery {
    select: (keyof UserPetHistory)[];
    where?: Partial<Pick<UserPetHistory, 'petID' | 'userID' | 'released'>>;
}

interface UpdateQuery {
    set: {
        released: 0 | 1;
    };
    where?: Partial<Pick<UserPetHistory, 'petID' | 'userID' | 'released'>>;
}

export class UserPetHistoryRepository {
    pool: Pool;

    constructor() {
        this.pool = getPool();
    }

    async find(query: FindQuery): Promise<UserPetHistory[]> {
        const { select, where = {} } = query;

        const fields = select.join(', ');

        // is empty string when `where` is empty
        const whereCondition = Object.entries(where)
            .map(([field, value]) => `${field}=${value}`)
            .join(' AND ');

        const whereQuery = whereCondition ? `WHERE ${whereCondition}` : '';

        const sql = `
            SELECT ${fields} FROM UserPetHistory
            ${whereQuery}
        `;

        const [rows] = await this.pool.query<UserPetHistoryRow[]>(sql);

        return rows;
    }

    async insertOne(petID: number, userID: number): Promise<void> {
        const sql = `
            INSERT INTO UserPetHistory
            (petID, userID)
            VALUES (${petID}, ${userID})
        `;

        await this.pool.query(sql);
    }

    async update(query: UpdateQuery): Promise<number> {
        const { set, where = {} } = query;

        // is empty string when `where` is empty
        const whereCondition = Object.entries(where)
            .map(([field, value]) => `${field}=${value}`)
            .join(' AND ');

        const whereQuery = whereCondition ? `WHERE ${whereCondition}` : '';

        const sql = `
            UPDATE UserPetHistory
            SET released=${set.released}
            ${whereQuery}
        `;

        const [result] = await this.pool.query<OkPacket>(sql);

        return result.changedRows;
    }
}
