import { RowDataPacket } from 'mysql2/promise';

export type SQLRow<T> = T & RowDataPacket;
export type GraphQLModel<T extends { id: number }> = Omit<T, 'id'> & {
    id: string;
};
