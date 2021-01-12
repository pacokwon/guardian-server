import { RowDataPacket } from 'mysql2';

export interface UserPetHistory {
    /**
     * @isInt
     */
    id: number;

    /**
     * @isInt
     */
    userID: number;

    /**
     * @isInt
     */
    petID: number;

    /**
     * @isInt
     */
    registeredAt: number;

    /**
     * @isInt
     */
    releasedAt: number;

    /**
     * @isInt
     */
    released: number;
}

export type UserPetHistoryRow = UserPetHistory & RowDataPacket;
