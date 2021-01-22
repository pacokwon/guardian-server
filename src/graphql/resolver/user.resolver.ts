import { IResolvers } from 'graphql-tools';
import DataLoader from 'dataloader';
import { User } from '../../model';
import { NestedPetHistoryOfUser } from '../../model/PetHistoryOfUser';
import { NestedUserPetHistory } from '../../model/UserPetHistory';
import * as UserService from '../../service/UserService';
import {
    SCHEMA_NAME as USER_SCHEMA_NAME,
    ListUserArgs,
    GetUserArgs,
    CreateUserArgs,
    UpdateUserArgs,
    DeleteUserArgs,
    SuccessStatus
} from '../schema/user.schema';
import { PaginationConnection } from '../../common/type';
import { convertToID, listToConnection } from '../../common/pagination';

// load **current pets** from a *userID*
const currentPetsLoader = new DataLoader<number, NestedPetHistoryOfUser[]>(
    userIDs => UserService.findPetsByUserIDs(userIDs, { currentOnly: true }),
    { cache: false }
);

// load **all pets including past** from a *userID*
const userPetHistoryLoader = new DataLoader<number, NestedPetHistoryOfUser[]>(
    userIDs => UserService.findPetsByUserIDs(userIDs, { currentOnly: false }),
    { cache: false }
);

export const userResolver: IResolvers = {
    Query: {
        users: async (
            _: unknown,
            { first, after }: ListUserArgs
        ): Promise<PaginationConnection<User>> => {
            // graphql specific pagination operations are done here
            const users = await UserService.findAll({
                after: after === undefined ? after : convertToID(after),
                pageSize: first
            });

            // Connection object using the limit count and schema name
            return listToConnection(users, first, USER_SCHEMA_NAME);
        },
        user: async (_: unknown, args: GetUserArgs): Promise<User> => {
            const user = await UserService.findOne(Number(args.id), {});
            return user || null;
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
        petHistory: async (
            parent: User,
            { currentOnly }: { currentOnly: boolean } // true by default
        ): Promise<NestedUserPetHistory[]> => {
            // user's id and nickname
            const { id, nickname } = parent;

            const petHistory = currentOnly
                ? await currentPetsLoader.load(id)
                : await userPetHistoryLoader.load(id);

            return petHistory.map(history => ({
                ...history,
                user: { id, nickname }
            }));
        }
    }
};
