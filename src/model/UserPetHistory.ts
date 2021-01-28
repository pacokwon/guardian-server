import { User } from './User';
import { Pet } from './Pet';

export interface UserPetHistory {
    /**
     * History row's identification number
     * @isInt
     */
    id: number;

    /**
     * The user's identification number
     * @isInt
     */
    userID: number;

    /**
     * The pet's identification number
     * @isInt
     */
    petID: number;

    /**
     * Date of registration
     */
    registeredAt: Date;

    /**
     * Date of unregistration. If pet is not unregistered yet, it will be equal to `registeredAt`
     */
    releasedAt: Date;

    /**
     * Whether this registration has been released or not.
     * @isInt
     */
    released: number;
}

export type NestedUserPetHistory = Omit<UserPetHistory, 'userID' | 'petID'> & {
    user: User;
    pet: Pet;
};
