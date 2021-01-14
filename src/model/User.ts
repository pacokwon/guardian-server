import { RowDataPacket } from 'mysql2';

/**
 * JSON object containing user information.
 */
export interface User {
    /**
     * @isInt
     */
    id: number;
    /**
     * @maxLength 30
     */
    nickname: string;
}
