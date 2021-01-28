import { UserPetHistory, NestedUserPetHistory } from './UserPetHistory';

/**
 * Single row containing details of a single registration + the informations of the corresponding **pet**.
 * A registration involves two entities, a user and a pet.
 * It can be a registration that is valid, or one that is already released.
 * If a registration is currently valid, the `releasedAt` field is equal to the `registeredAt` field.
 */
export interface PetHistoryOfUser extends UserPetHistory {
    /**
     * The pet's species (e.g. cat, dog)
     */
    species: string;

    /**
     * The pet's nickname
     */
    nickname: string;

    /**
     * A public url hosting the pet's image
     */
    imageUrl: string;
}

// a history of **pets**
export type NestedPetHistoryOfUser = Omit<NestedUserPetHistory, 'user'>;
