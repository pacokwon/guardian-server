import { Pool, OkPacket } from 'mysql2/promise';
import { getPool } from '@/common/db';
import { SQLRow } from '@/common/type';
import { UserPetHistory } from '@/model/UserPetHistory';

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

export interface UserHistoryOfPet extends UserPetHistory {
    /**
     * The user's nickname
     */
    nickname: string;
}

export interface PetHistoryOfUser extends UserPetHistory {
    /**
     * The pet's species (e.g. cat, dog)
     */
    species?: string;

    /**
     * The pet's nickname
     */
    nickname?: string;

    /**
     * A public url hosting the pet's image
     */
    imageUrl?: string;
}

export interface FindHistoryOptions {
    page?: number;
    pageSize?: number;
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

        const [rows] = await this.pool.query<SQLRow<UserPetHistory>[]>(sql);

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

    async findUsersHistoryFromPetID(
        petID: number,
        options: FindHistoryOptions = {}
    ): Promise<UserHistoryOfPet[]> {
        const { page = 1, pageSize = 10 } = options;
        const limit = Math.min(pageSize, 100);
        const offset = (page - 1) * pageSize;

        const sql = `
            SELECT History.*, User.nickname
            FROM UserPetHistory History INNER JOIN User
            ON History.petID=${petID} AND History.userID=User.id
            LIMIT ${limit}
            OFFSET ${offset}
        `;

        const [rows] = await this.pool.query<SQLRow<UserHistoryOfPet>[]>(sql);

        return rows;
    }

    async findPetsHistoryFromUserID(
        userID: number,
        options: FindHistoryOptions = {}
    ): Promise<PetHistoryOfUser[]> {
        const { page = 1, pageSize = 10 } = options;
        const limit = Math.min(pageSize, 100);
        const offset = (page - 1) * pageSize;

        const sql = `
            SELECT History.*, Pet.nickname
            FROM UserPetHistory History INNER JOIN Pet
            ON History.userID=${userID} AND History.petID=Pet.id
            LIMIT ${limit}
            OFFSET ${offset}
        `;

        const [rows] = await this.pool.query<SQLRow<PetHistoryOfUser>[]>(sql);

        return rows;
    }
}
