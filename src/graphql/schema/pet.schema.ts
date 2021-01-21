import { gql } from 'apollo-server';

export interface ListPetArgs {
    first: number; // this field is optional in the schema, but has a default value
    after?: string;
}

export interface GetPetArgs {
    id: string;
}

export interface CreatePetArgs {
    nickname: string;
    species: string;
    imageUrl: string;
}

type UpdatePetInput = CreatePetArgs;

export interface UpdatePetArgs {
    id: string;
    input: UpdatePetInput;
}

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
        userHistory: [UserPetHistory!]!
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
        nickname: String
        species: String
        imageUrl: String
    }

    extend type Query {
        pets(first: Int = 10, after: String): PetConnection!
        pet(id: ID!): Pet!
    }

    extend type Mutation {
        createPet(param: CreatePetInput!): Pet!
        updatePet(id: ID!, param: UpdatePetInput!): Pet!
        deletePet(id: ID!): SuccessStatus!
    }
`;
