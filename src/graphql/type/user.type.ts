import { gql } from 'apollo-server';

export interface QueryUserArgs {
    id: string;
}

export interface CreateUserArgs {
    nickname: string;
}

export interface UpdateUserArgs {
    id: string;
    input: UserUpdateInput;
}

export type DeleteUserArgs = UpdateUserArgs;

export interface SuccessStatus {
    success: boolean;
    message?: string;
}

export interface UserUpdateInput {
    nickname: string;
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
        users: [User]
        user(id: ID!): User
    }

    type Mutation {
        createUser(nickname: String!): SuccessStatus
        updateUser(id: ID!, input: UserUpdateInput): SuccessStatus
        deleteUser(id: ID!): SuccessStatus
    }
`;
