import { gql } from 'apollo-server';

export const userPetHistoryTypeDef = gql`
    interface UserPetHistory {
        "yyyy-mm-dd hh:mm:ss"
        registeredAt: String!

        "yyyy-mm-dd hh:mm:ss"
        releasedAt: String!

        released: Boolean!
    }

    type UserHistory implements UserPetHistory {
        id: ID!
        nickname: String!

        petHistory(currentOnly: Boolean = true): [PetHistory!]!

        "yyyy-mm-dd hh:mm:ss"
        registeredAt: String!

        "yyyy-mm-dd hh:mm:ss"
        releasedAt: String!
        released: Boolean!
    }

    type PetHistory implements UserPetHistory {
        id: ID!
        nickname: String!
        species: String!
        imageUrl: String!

        guardian: User
        userHistory: [UserHistory!]!

        "yyyy-mm-dd hh:mm:ss"
        registeredAt: String!

        "yyyy-mm-dd hh:mm:ss"
        releasedAt: String!
        released: Boolean!
    }
`;
