import { gql } from 'apollo-server';

export const paginationTypeDef = gql`
    type PageInfo {
        hasNextPage: Boolean!
        endCursor: String!
    }
`;
