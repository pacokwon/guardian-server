import { IResolvers } from 'graphql-tools';
import { GraphQLScalarType, Kind } from 'graphql';

export const dateResolver: IResolvers = {
    Date: new GraphQLScalarType({
        name: 'Date',
        description: 'Date custom scalar type',
        parseValue(value) {
            return new Date(value);
        },
        serialize(value) {
            if (typeof value === 'string') return new Date(value).getTime();

            return value.getTime();
        },
        parseLiteral(ast) {
            if (ast.kind === Kind.INT) return parseInt(ast.value, 10);

            return null;
        }
    })
};
