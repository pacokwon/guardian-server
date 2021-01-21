import { UserPetHistory } from './UserPetHistory';
import { User } from './User';

/**
 * Single row containing details of a single registration + the informations of the corresponding **user**.
 * A registration involves two entities, a user and a pet.
 * It can be a registration that is valid, or one that is already released.
 * If a registration is currently valid, the `releasedAt` field is equal to the `registeredAt` field.
 */
export interface UserHistoryOfPet extends UserPetHistory {
    /**
     * The user's nickname
     */
    nickname: string;
}

export type NestedUserHistoryOfPet = Omit<UserPetHistory, 'userID'> & {
    user: User;
};
