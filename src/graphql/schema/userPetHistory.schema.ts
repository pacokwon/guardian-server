import { gql } from 'apollo-server';

export const userPetHistoryTypeDef = gql`
    interface UserPetHistory {
        registeredAt: Date!
        releasedAt: Date!
        released: Boolean!
    }

    type UserHistory implements UserPetHistory {
        "history's id"
        id: ID!

        "user must exist"
        user: User!

        registeredAt: Date!
        releasedAt: Date!
        released: Boolean!
    }

    type PetHistory implements UserPetHistory {
        "history's id"
        id: ID!

        "pet must exist"
        pet: Pet!

        registeredAt: Date!
        releasedAt: Date!
        released: Boolean!
    }
`;
