/**
 * JSON object containing pet information.
 */
export interface Pet {
    /**
     * The pet's identification number;
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

export const petFields = ['id', 'species', 'nickname', 'imageUrl'];
