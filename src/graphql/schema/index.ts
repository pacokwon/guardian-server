import { makeExecutableSchema } from 'graphql-tools';
import { userResolver } from '../resolver/user.resolver';
import { userTypeDef } from '../type/user.type';

export const schema = makeExecutableSchema({
    typeDefs: userTypeDef,
    resolvers: userResolver
});
