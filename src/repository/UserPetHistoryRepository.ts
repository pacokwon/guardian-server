import { Pool, OkPacket, escape } from 'mysql2/promise';
import { getPool } from '../common/db';
import { SQLRow } from '../common/type';
import { UserPetHistory } from '../model/UserPetHistory';

interface FindQuery {
    field: (keyof UserPetHistory)[];
    where?: Partial<Pick<UserPetHistory, 'petID' | 'userID' | 'released'>>;
}

interface UpdateQuery {
    set: { released: 0 | 1 };
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
    where?: Partial<Pick<UserPetHistory, 'petID' | 'userID' | 'released'>>;
}

export class UserPetHistoryRepository {
    pool: Pool;

    constructor() {
        this.pool = getPool();
    }

    async find(query: FindQuery): Promise<UserPetHistory[]> {
        const {
            field = ['id', 'userID', 'petID', 'releasedAt', 'registeredAt'],
            where = {}
        } = query;

        // is empty string when `where` is empty
        const whereCondition = Object.entries(where)
            .map(([field, value]) => `${field}=${escape(value)}`)
            .join(' AND ');

        const whereQuery = whereCondition ? whereCondition : '1';

        const sql = `
            SELECT ?? FROM UserPetHistory
            WHERE ${whereQuery}
        `;

        const [rows] = await this.pool.query<SQLRow<UserPetHistory>[]>(sql, [
            field
        ]);

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
            .map(([field, value]) => `${field}=${escape(value)}`)
            .join(' AND ');

        const whereQuery = whereCondition ? `${whereCondition}` : '1';

        const sql = `
            UPDATE UserPetHistory
            SET released=?
            WHERE ${whereQuery}
        `;

        const [result] = await this.pool.query<OkPacket>(sql, [set.released]);

        return result.changedRows;
    }

    async findUsersHistoryFromPetID(
        petID: number,
        options: FindHistoryOptions
    ): Promise<UserHistoryOfPet[]> {
        const { page = 1, pageSize = 10, where = {} } = options;
        const limit = Math.min(pageSize, 100);
        const offset = (page - 1) * pageSize;

        // is empty string when `where` is empty
        const whereCondition = Object.entries(where)
            .map(([field, value]) => `${field}=${escape(value)}`)
            .join(' AND ');

        const whereQuery = whereCondition ? whereCondition : '1';

        const sql = `
            SELECT History.*, User.nickname
            FROM UserPetHistory History INNER JOIN User
            ON History.petID=? AND History.userID=User.id
            WHERE ${whereQuery} AND User.deleted = 0
            LIMIT ?
            OFFSET ?
        `;

        const [rows] = await this.pool.query<SQLRow<UserHistoryOfPet>[]>(sql, [
            petID,
            limit,
            offset
        ]);

        return rows;
    }

    async findPetsHistoryFromUserID(
        userID: number,
        options: FindHistoryOptions
    ): Promise<PetHistoryOfUser[]> {
        const { page = 1, pageSize = 10, where = {} } = options;
        const limit = Math.min(pageSize, 100);
        const offset = (page - 1) * pageSize;

        // is empty string when `where` is empty
        const whereCondition = Object.entries(where)
            .map(([field, value]) => `${field}=${escape(value)}`)
            .join(' AND ');

        const whereQuery = whereCondition ? whereCondition : '1';

        const sql = `
            SELECT History.*, Pet.nickname
            FROM UserPetHistory History INNER JOIN Pet
            ON History.userID=? AND History.petID=Pet.id
            WHERE ${whereQuery} AND Pet.deleted = 0
            LIMIT ?
            OFFSET ?
        `;

        const [rows] = await this.pool.query<SQLRow<PetHistoryOfUser>[]>(sql, [
            userID,
            limit,
            offset
        ]);

        return rows;
    }
}
