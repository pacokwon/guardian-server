import { RowDataPacket } from 'mysql2';

/**
 * JSON object containing pet information.
 */
export interface Pet {
    /**
     * @isInt
     */
    id: number;
    /**
     * @maxLength 10
     */
    species: string;
    /**
     * @maxLength 30
     */
    nickname: string;
    imageUrl: string;
}

export type PetRow = Pet & RowDataPacket;
