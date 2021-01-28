import { gql } from 'apollo-server';

export const SCHEMA_NAME = 'Pet';

export interface ListPetArgs {
    first: number; // this field is optional in the schema, but has a default value
    after?: string;
}

export type ListUserHistoryArgs = ListPetArgs;

export interface GetPetArgs {
    id: string;
}

export interface CreatePetArgs {
    nickname: string;
    species: string;
    imageUrl: string;
}

export type UpdatePetArgs = CreatePetArgs & {
    id: string;
};

export interface DeletePetArgs {
    id: string;
}

export interface SuccessStatus {
    success: boolean;
    message?: string;
}

export const petTypeDef = gql`
    type Pet {
        id: ID!
        nickname: String!
        species: String!
        imageUrl: String!

        guardian: User
        userHistory(first: Int = 10, after: String): UserPetHistoryConnection!
    }

    type PetConnection {
        pageInfo: PageInfo!
        edges: [PetEdge!]!
    }

    type PetEdge {
        cursor: String!
        node: Pet!
    }

    input CreatePetInput {
        nickname: String!
        species: String!
        imageUrl: String!
    }

    input UpdatePetInput {
        id: ID!
        nickname: String
        species: String
        imageUrl: String
    }

    extend type Query {
        pets(first: Int = 10, after: String): PetConnection!
        pet(id: ID!): Pet!
    }

    extend type Mutation {
        createPet(input: CreatePetInput!): Pet!
        updatePet(input: UpdatePetInput!): Pet!
        deletePet(id: ID!): SuccessStatus!
    }
`;
