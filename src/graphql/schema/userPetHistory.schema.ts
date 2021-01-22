import { gql } from 'apollo-server';

export const userPetHistoryTypeDef = gql`
    type UserPetHistory {
        "history's id"
        id: ID!

        "user must exist"
        user: Pet!

        "pet must exist"
        pet: Pet!

        registeredAt: Date!
        releasedAt: Date!
        released: Boolean!
    }
`;
