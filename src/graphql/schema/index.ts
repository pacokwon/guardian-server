import { gql } from 'apollo-server';
import { makeExecutableSchema } from 'graphql-tools';
import { dateResolver, userResolver, petResolver } from '../resolver';
import { userTypeDef } from './user.schema';
import { petTypeDef } from './pet.schema';
import { paginationTypeDef } from './pagination.schema';
import { userPetHistoryTypeDef } from './userPetHistory.schema';

const baseTypeDef = gql`
    scalar Date

    type Query {
        _empty: String
    }

    type Mutation {
        _empty: String
    }

    type SuccessStatus {
        success: Boolean!
        message: String
    }
`;

export const schema = makeExecutableSchema({
    typeDefs: [
        baseTypeDef,
        paginationTypeDef,
        userTypeDef,
        petTypeDef,
        userPetHistoryTypeDef
    ],
    resolvers: [dateResolver, userResolver, petResolver]
});
