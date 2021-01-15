import { makeExecutableSchema } from 'graphql-tools';
import { userResolver } from '@/graphql/resolver/user.resolver';
import { userTypeDef } from '@/graphql/type/user.type';

export const schema = makeExecutableSchema({
    typeDefs: userTypeDef,
    resolvers: userResolver
});
