import { IResolvers } from 'graphql-tools';
import DataLoader from 'dataloader';
import { User } from '../../model';
import { NestedPetHistoryOfUser } from '../../model/PetHistoryOfUser';
import { NestedUserPetHistory } from '../../model/UserPetHistory';
import * as UserService from '../../service/UserService';
import {
    SCHEMA_NAME as USER_SCHEMA_NAME,
    ListUserArgs,
    ListPetHistoryArgs,
    GetUserArgs,
    CreateUserArgs,
    UpdateUserArgs,
    DeleteUserArgs,
    SuccessStatus
} from '../schema/user.schema';
import { SCHEMA_NAME as HISTORY_SCHEMA_NAME } from '../schema/userPetHistory.schema';
import { PaginationConnection } from '../../common/type';
import { convertToID, listToConnection } from '../../common/pagination';

// load **current pets** from a *userID*
const currentPetsLoader = new DataLoader<number, NestedPetHistoryOfUser[]>(
    userIDs => UserService.findPetsByUserIDs(userIDs, { currentOnly: true }),
    { cache: false }
);

export const userResolver: IResolvers = {
    Query: {
        users: async (
            _: unknown,
            { first, after: afterCursor }: ListUserArgs
        ): Promise<PaginationConnection<User>> => {
            const after = convertToID(afterCursor);

            // graphql specific pagination operations are done here
            const users = await UserService.findAll({
                after,
                pageSize: first
            });

            // Connection object using the limit count and schema name
            return listToConnection(users, first, USER_SCHEMA_NAME);
        },
        user: async (_: unknown, args: GetUserArgs): Promise<User> => {
            const user = await UserService.findOne(Number(args.id), {});
            return user;
        }
    },
    Mutation: {
        createUser: async (
            _: unknown,
            { input }: { input: CreateUserArgs }
        ): Promise<User> => {
            const { nickname } = input;
            const id = await UserService.createOne(nickname);
            return { id, nickname };
        },
        updateUser: async (
            _: unknown,
            { input }: { input: UpdateUserArgs }
        ): Promise<User> => {
            const { id, nickname } = input;
            const updatedUser = await UserService.updateOne(
                Number(id),
                nickname
            );
            return updatedUser;
        },
        deleteUser: async (
            _: unknown,
            { id }: DeleteUserArgs
        ): Promise<SuccessStatus> => {
            // if there is an error, let it pass
            await UserService.removeOne(Number(id));

            return { success: true };
        },
        registerUserToPet: async (
            _: unknown,
            args: { userID: string; petID: string }
        ): Promise<SuccessStatus> => {
            await UserService.registerPet(
                Number(args.petID),
                Number(args.userID)
            );

            return { success: true };
        },
        unregisterUserFromPet: async (
            _: unknown,
            args: { userID: string; petID: string }
        ): Promise<SuccessStatus> => {
            await UserService.unregisterPet(
                Number(args.petID),
                Number(args.userID)
            );

            return { success: true };
        }
    },
    User: {
        pets: async (parent: User): Promise<NestedUserPetHistory[]> => {
            // user's id and nickname
            const { id, nickname } = parent;

            const petHistory = await currentPetsLoader.load(id);

            return petHistory.map(history => ({
                ...history,
                user: { id, nickname }
            }));
        },
        petHistory: async (
            parent: User,
            { first, after: afterCursor }: ListPetHistoryArgs
        ): Promise<PaginationConnection<NestedUserPetHistory>> => {
            const after = convertToID(afterCursor);

            const petHistory = await UserService.findPetHistory(parent.id, {
                after,
                pageSize: first,
                all: true
            });

            const nestedPetHistory = petHistory.map(
                ({ petID, species, nickname, imageUrl, ...history }) => ({
                    pet: { id: petID, species, nickname, imageUrl },
                    user: { ...parent },
                    ...history
                })
            );

            // Connection object using the limit count and schema name
            return listToConnection(
                nestedPetHistory,
                first,
                HISTORY_SCHEMA_NAME
            );
        }
    }
};
