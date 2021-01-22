import { PaginationConnection, Identifiable, PaginationEdge } from './type';

export const convertToCursor = (nodeID: string | number, type = ''): string =>
    Buffer.from(`${type}:${nodeID}`, 'binary').toString('base64');

export const convertToID = (cursor: string): number => {
    const decoded = Buffer.from(cursor, 'base64').toString('binary');
    const [_, nodeID] = decoded.split(':');

    if (nodeID === undefined)
        throw Error('Invalid Cursor: decoded cursor does not contain nodeID');

    return Number(nodeID);
};

const mapToEdges = <T extends Identifiable>(
    list: T[],
    type: string
): PaginationEdge<T>[] =>
    list.map(node => ({
        cursor: convertToCursor(node.id, type),
        node
    }));

export const listToConnection = <T extends Identifiable>(
    list: T[],
    limit: number,
    type: string
): PaginationConnection<T> => {
    const edges = mapToEdges(list, type);
    const pageInfo =
        edges.length === 0
            ? { hasNextPage: false, endCursor: '' }
            : {
                  hasNextPage: edges.length === limit,
                  endCursor: edges[edges.length - 1].cursor
              };

    return { edges, pageInfo };
};
