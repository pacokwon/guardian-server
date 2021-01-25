import { gql } from 'apollo-server';

export const SCHEMA_NAME = 'User';

export interface ListUserArgs {
    first: number; // this field is optional in the schema, but has a default value
    after?: string;
}

export type ListPetHistoryArgs = ListUserArgs;

export interface GetUserArgs {
    id: string;
}

export interface CreateUserArgs {
    nickname: string;
}

export type UpdateUserArgs = CreateUserArgs & {
    id: string;
};

export type DeleteUserArgs = GetUserArgs;

export interface SuccessStatus {
    success: boolean;
    message?: string;
}

export const userTypeDef = gql`
    type User {
        id: ID!
        nickname: String!

        "pets currently registered to this user"
        currentPets: [UserPetHistory!]!

        "list of all pets, including current pets"
        petHistory(first: Int = 10, after: String): UserPetHistoryConnection!
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
        id: ID!
        nickname: String
    }

    extend type Query {
        users(first: Int = 10, after: String): UserConnection!
        user(id: ID!): User!
    }

    extend type Mutation {
        createUser(input: CreateUserInput!): User!
        updateUser(input: UpdateUserInput!): User!
        deleteUser(id: ID!): SuccessStatus!

        registerUserToPet(petID: ID!, userID: ID!): SuccessStatus!
        unregisterUserFromPet(petID: ID!, userID: ID!): SuccessStatus!
    }
`;
