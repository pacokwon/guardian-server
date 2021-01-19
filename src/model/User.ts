/**
 * JSON object containing user information.
 */
export interface User {
    /**
     * The user's identification number;
     * @isInt
     */
    id: number;
    /**
     * @maxLength 30
     */
    nickname: string;
}

export const userFields = ['id', 'nickname'];
