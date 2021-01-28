import { RowDataPacket } from 'mysql2/promise';

export type SQLRow<T> = T & RowDataPacket;

export type PageInfo = {
    hasNextPage: boolean;
    endCursor: string;
};

export type PaginationEdge<T> = {
    cursor: string;
    node: T;
};

export type PaginationConnection<T> = {
    pageInfo: PageInfo;
    edges: PaginationEdge<T>[];
};

export type Identifiable = { id: number };
