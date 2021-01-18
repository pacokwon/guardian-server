import { gql } from 'apollo-server';

export interface ListUserArgs {
    page?: number;
    pageSize?: number;
}

export interface GetUserArgs {
    id: string;
}

export interface CreateUserArgs {
    nickname: string;
}

export interface UpdateUserArgs {
    id: string;
    input: { nickname: string };
}

export type DeleteUserArgs = GetUserArgs;

export interface SuccessStatus {
    success: boolean;
    message?: string;
}

export const userTypeDef = gql`
    type User {
        id: ID
        nickname: String
    }

    type SuccessStatus {
        success: Boolean!
        message: String
    }

    input UserUpdateInput {
        nickname: String
    }

    type Query {
        users(page: Int, pageSize: Int): [User]
        user(id: ID!): User
    }

    type Mutation {
        createUser(nickname: String!): SuccessStatus
        updateUser(id: ID!, input: UserUpdateInput): SuccessStatus
        deleteUser(id: ID!): SuccessStatus
    }
`;
