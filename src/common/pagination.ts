import { PageInfo, Identifiable, PaginationEdge } from './type';

export const convertToCursor = (nodeID: string | number): string =>
    Buffer.from(nodeID.toString(), 'binary').toString('base64');

export const convertToID = (cursor: string): number =>
    Number(Buffer.from(cursor, 'base64').toString('binary'));

export const listToPageInfo = (
    list: Identifiable[],
    limit: number
): PageInfo => ({
    hasNextPage: list.length < limit,
    endCursor: convertToCursor(list[list.length - 1].id)
});

export const mapToEdgeList = <T extends Identifiable>(
    list: T[]
): PaginationEdge<T>[] =>
    list.map(node => ({
        cursor: convertToCursor(node.id),
        node
    }));
