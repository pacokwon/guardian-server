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

        userID: Int!
        nickname: String!
        petHistory(currentOnly: Boolean = true): [PetHistory!]!

        registeredAt: Date!
        releasedAt: Date!
        released: Boolean!
    }

    type PetHistory implements UserPetHistory {
        "history's id"
        id: ID!

        petID: Int!
        nickname: String!
        species: String!
        imageUrl: String!

        guardian: User
        userHistory: [UserHistory!]!

        registeredAt: Date!
        releasedAt: Date!
        released: Boolean!
    }
`;
