import { gql } from 'apollo-server';

export const userPetHistoryTypeDef = gql`
    type UserPetHistory {
        id: ID!
        user: User!
        pet: Pet!

        "yyyy-mm-dd hh:mm:ss"
        registeredAt: String!

        "yyyy-mm-dd hh:mm:ss"
        releasedAt: String!

        released: Boolean!
    }
`;
