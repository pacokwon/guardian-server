import { gql } from 'apollo-server';

export interface ListUserArgs {
    first?: number;
    after?: string;
}

export interface GetUserArgs {
    id: string;
}

export interface CreateUserArgs {
    nickname: string;
}

type UpdateUserInput = CreateUserArgs;

export interface UpdateUserArgs {
    id: string;
    input: UpdateUserInput;
}

export type DeleteUserArgs = GetUserArgs;

export interface SuccessStatus {
    success: boolean;
    message?: string;
}

export const userTypeDef = gql`
    type User {
        id: ID!
        nickname: String!

        "user's registered pets. if 'currentOnly' is false, get past history too"
        petHistory(currentOnly: Boolean = true): [UserPetHistory!]!
    }

    type UserConnection {
        pageInfo: PageInfo!
        edges: [UserEdge!]!
    }

    type UserEdge {
        cursor: String!
        node: User!
    }

    input CreateUserInput {
        nickname: String!
    }

    input UpdateUserInput {
        nickname: String
    }

    extend type Query {
        users(first: Int = 10, after: String): UserConnection!
        user(id: ID!): User!
    }

    extend type Mutation {
        createUser(param: CreateUserInput!): User!
        updateUser(id: ID!, input: UpdateUserInput!): User!
        deleteUser(id: ID!): SuccessStatus!

        registerUserToPet(userID: ID!, petID: ID!): SuccessStatus!
        unregisterUserFromPet(userID: ID!, petID: ID!): SuccessStatus!
    }
`;