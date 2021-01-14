import { RowDataPacket } from 'mysql2';

export interface UserPetHistory {
    /**
     * @isInt
     */
    id: number;

    /**
     * The pet's id
     * @isInt
     */
    userID: number;

    /**
     * The pet's id
     * @isInt
     */
    petID: number;

    /**
     * Date of registration
     */
    registeredAt: string;

    /**
     * Date of unregistration. If pet is not unregistered yet, it will be equal to `registeredAt`
     */
    releasedAt: string;

    /**
     * Whether this registration has been released or not.
     * @isInt
     */
    released: number;
}

export type UserPetHistoryRow = UserPetHistory & RowDataPacket;
