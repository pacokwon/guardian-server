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
        id: ID
        nickname: String
    }

    input UpdateUserInput {
        nickname: String
    }

    extend type Query {
        users(page: Int, pageSize: Int): [User]
        user(id: ID!): User
    }

    extend type Mutation {
        createUser(nickname: String!): SuccessStatus
        updateUser(id: ID!, input: UpdateUserInput): SuccessStatus
        deleteUser(id: ID!): SuccessStatus
    }
`;
