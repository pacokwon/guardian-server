import { Pool, OkPacket, escape } from 'mysql2/promise';
import { getPool } from '../common/db';
import { SQLRow } from '../common/type';
import { ApiError, Summary } from '../common/error';
import { User, UserPetHistory } from '../model';
import {
    UserHistoryOfPet,
    NestedUserHistoryOfPet
} from '../model/UserHistoryOfPet';
import {
    PetHistoryOfUser,
    NestedPetHistoryOfUser
} from '../model/PetHistoryOfUser';

interface FindQuery {
    field: (keyof UserPetHistory)[];
    where?: Partial<Pick<UserPetHistory, 'petID' | 'userID' | 'released'>>;
}

interface UpdateQuery {
    set: { released: 0 | 1 };
    where?: Partial<Pick<UserPetHistory, 'petID' | 'userID' | 'released'>>;
}

interface FindPetsByUserIDsOptions {
    where?: { released: 0 | 1 };
}

export interface FindHistoryOptions {
    page?: number;
    pageSize?: number;
    where?: Partial<Pick<UserPetHistory, 'petID' | 'userID' | 'released'>>;
    after?: number;
}

export interface FindUserHistoryResult {
    userHistory: UserHistoryOfPet[];
    hasNext: boolean;
}

export interface FindPetHistoryResult {
    petHistory: PetHistoryOfUser[];
    hasNext: boolean;
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

    async update(query: UpdateQuery): Promise<void> {
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

        if (result.changedRows === 0)
            throw new ApiError(Summary.NotFound, 'User not found');
        else if (result.changedRows > 1)
            throw new ApiError(
                Summary.InternalServerError,
                'Multiple rows have changed'
            );
    }

    async findUserHistoryFromPetID(
        petID: number,
        options: FindHistoryOptions
    ): Promise<FindUserHistoryResult> {
        const { page = 1, pageSize = 10, where = {}, after } = options;
        const limit = Math.min(pageSize, 100);

        // is empty string when `where` is empty
        const whereCondition = Object.entries(where)
            .map(([field, value]) => `${field}=${escape(value)}`)
            .join(' AND ');

        const whereQuery = whereCondition ? whereCondition : '1';

        if (after === undefined) {
            // use offset
            const offset = (page - 1) * pageSize;

            const [userHistory] = await this.pool.query<
                SQLRow<UserHistoryOfPet>[]
            >(
                `
                SELECT User.nickname, History.*
                FROM UserPetHistory History INNER JOIN User
                ON History.petID=? AND History.userID=User.id
                WHERE ${whereQuery} AND User.deleted = 0
                LIMIT ?
                OFFSET ?
            `,
                [petID, limit + 1, offset]
            );
            const hasNext = userHistory.length === limit + 1;

            return { userHistory: userHistory.slice(0, limit), hasNext };
        } else {
            // use cursor
            const [userHistory] = await this.pool.query<
                SQLRow<UserHistoryOfPet>[]
            >(
                `
                SELECT User.nickname, History.*
                FROM UserPetHistory History INNER JOIN User
                ON History.petID=? AND History.userID=User.id
                WHERE ${whereQuery} AND User.deleted = 0 AND History.id > ?
                ORDER BY History.id
                LIMIT ?
            `,
                [petID, after, limit + 1]
            );
            const hasNext = userHistory.length === limit + 1;

            return { userHistory: userHistory.slice(0, limit), hasNext };
        }
    }

    async findPetHistoryFromUserID(
        userID: number,
        options: FindHistoryOptions
    ): Promise<FindPetHistoryResult> {
        const { page = 1, pageSize = 10, where = {}, after } = options;
        const limit = Math.min(pageSize, 100);

        // is empty string when `where` is empty
        const whereCondition = Object.entries(where)
            .map(([field, value]) => `${field}=${escape(value)}`)
            .join(' AND ');

        const whereQuery = whereCondition ? whereCondition : '1';

        if (after === undefined) {
            // use offset
            const offset = (page - 1) * pageSize;

            const [petHistory] = await this.pool.query<
                SQLRow<PetHistoryOfUser>[]
            >(
                `
                SELECT Pet.nickname, Pet.species, Pet.imageUrl, History.*
                FROM UserPetHistory History INNER JOIN Pet
                ON History.userID=? AND History.petID=Pet.id
                WHERE ${whereQuery} AND Pet.deleted = 0
                LIMIT ?
                OFFSET ?
            `,
                [userID, limit + 1, offset]
            );
            const hasNext = petHistory.length === limit + 1;

            return { petHistory: petHistory.slice(0, limit), hasNext };
        } else {
            // use cursor
            const [petHistory] = await this.pool.query<
                SQLRow<PetHistoryOfUser>[]
            >(
                `
                SELECT Pet.nickname, Pet.species, Pet.imageUrl, History.*
                FROM UserPetHistory History INNER JOIN Pet
                ON History.userID=? AND History.petID=Pet.id
                WHERE ${whereQuery} AND Pet.deleted = 0 AND History.id > ?
                ORDER BY History.id
                LIMIT ?
            `,
                [userID, after, limit + 1]
            );
            const hasNext = petHistory.length === limit + 1;

            return { petHistory: petHistory.slice(0, limit), hasNext };
        }
    }

    // constraints: 1) preserve id order. 2) preserve input length
    async findPetsByUserIDs(
        userIDs: readonly number[],
        options?: FindPetsByUserIDsOptions
    ): Promise<NestedPetHistoryOfUser[][]> {
        // if `where` is undefined, select all. otherwise, filter with `released`
        const whereQuery =
            options?.where === undefined
                ? '1'
                : `released=${options?.where.released}`;

        const sql = `
            SELECT Pet.nickname, Pet.species, Pet.imageUrl, History.*
            FROM Pet JOIN UserPetHistory History
            ON History.userID IN (?)
            AND History.petID = Pet.id
            WHERE ${whereQuery}
        `;

        // a flattened array with different userIDs will be returned
        const [rows] = await this.pool.query<SQLRow<PetHistoryOfUser>[]>(sql, [
            userIDs
        ]);

        return userIDs.map(id =>
            rows
                .filter(({ userID }) => id === userID)
                .map(({ petID, species, nickname, imageUrl, ...history }) => ({
                    pet: { id: petID, species, nickname, imageUrl },
                    ...history
                }))
        );
    }

    async findUsersByPetIDs(
        petIDs: readonly number[]
    ): Promise<NestedUserHistoryOfPet[][]> {
        const sql = `
            SELECT User.nickname, History.*
            FROM User JOIN UserPetHistory History
            ON History.petID IN (?)
            AND History.userID = User.id
        `;

        // a flattened array with different petIDs will be returned
        const [rows] = await this.pool.query<SQLRow<UserHistoryOfPet>[]>(sql, [
            petIDs
        ]);

        // group the flat result in a 2D array and return
        return petIDs.map(id =>
            rows
                .filter(({ petID }) => id === petID)
                .map(({ userID, nickname, ...history }) => ({
                    user: { id: userID, nickname },
                    ...history
                }))
        );
    }

    async findGuardiansByPetIDs(
        petIDs: readonly number[]
    ): Promise<(User | null)[]> {
        const sql = `
            SELECT User.*,History.petID
            FROM UserPetHistory History INNER JOIN User
            ON History.petID IN (?)
            AND History.userID = User.id
            WHERE History.released = 0
        `;

        const [rows] = await this.pool.query<
            SQLRow<User & { petID: number }>[]
        >(sql, [petIDs]);

        return petIDs.map(id => rows.find(({ petID }) => id === petID) || null);
    }
}
