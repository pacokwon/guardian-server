import { gql } from 'apollo-server';
import { makeExecutableSchema } from 'graphql-tools';
import { userResolver, petResolver } from '../resolver';
import { userTypeDef } from './user.schema';
import { petTypeDef } from './pet.schema';
import { userPetHistoryTypeDef } from './userPetHistory.schema';

const baseTypeDef = gql`
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
    typeDefs: [baseTypeDef, userTypeDef, petTypeDef, userPetHistoryTypeDef],
    resolvers: [userResolver, petResolver]
});
