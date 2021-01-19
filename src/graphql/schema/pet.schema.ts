import { gql } from 'apollo-server';

export interface ListPetArgs {
    page?: number;
    pageSize?: number;
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

        "pet's registered user(s). if 'currentOnly' is false, get past history too"
        users(currentOnly: Boolean = true): [UserPetHistory!]!
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
        pets(page: Int, pageSize: Int): [Pet!]!
        pet(id: ID!): Pet
    }

    extend type Mutation {
        createPet(param: CreatePetInput!): Pet!
        updatePet(id: ID!, param: UpdatePetInput!): Pet!
        deletePet(id: ID!): SuccessStatus!
    }
`;
