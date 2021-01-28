import { PaginationConnection, Identifiable, PaginationEdge } from './type';

export const convertToCursor = (nodeID: string | number, type = ''): string =>
    Buffer.from(`${type}:${nodeID}`, 'binary').toString('base64');

export const convertToID = (cursor: string | undefined): number => {
    if (cursor === undefined) return 0;

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

export const makeConnection = <T extends Identifiable>(params: {
    list: T[]; // actual list of results
    hasNext: boolean; // whether there are more results to come after this list
    type: string; // type of resource e.g. 'User', 'Pet'
}): PaginationConnection<T> => {
    const { list, hasNext, type } = params;
    const edges = mapToEdges(list, type);
    const pageInfo =
        edges.length === 0
            ? { hasNextPage: false, endCursor: '' }
            : {
                  hasNextPage: hasNext, // if there are more to come
                  endCursor: edges[edges.length - 1].cursor
              };

    return { edges, pageInfo };
};
