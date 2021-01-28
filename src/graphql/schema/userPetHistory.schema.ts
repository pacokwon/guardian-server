import { gql } from 'apollo-server';

export const SCHEMA_NAME = 'UserPetHistory';

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

    type UserPetHistoryConnection {
        pageInfo: PageInfo!
        edges: [UserPetHistoryEdge!]!
    }

    type UserPetHistoryEdge {
        cursor: String!
        node: UserPetHistory!
    }
`;
