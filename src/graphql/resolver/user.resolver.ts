import { IResolvers } from 'graphql-tools';
import DataLoader from 'dataloader';
import { User } from '../../model';
import { NestedPetHistoryOfUser } from '../../model/PetHistoryOfUser';
import * as UserService from '../../service/UserService';
import {
    ListUserArgs,
    GetUserArgs,
    CreateUserArgs,
    UpdateUserArgs,
    DeleteUserArgs,
    SuccessStatus
} from '../schema/user.schema';
import { PaginationConnection } from '../../common/type';
import {
    convertToID,
    listToPageInfo,
    mapToEdgeList
} from '../../common/pagination';

// load **pets** from a *userID*
const userPetLoader = new DataLoader<number, NestedPetHistoryOfUser[]>(
    userIDs => UserService.findPetsByUserIDs(userIDs),
    {
        cache: false
    }
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

            return {
                pageInfo: listToPageInfo(users, first),
                edges: mapToEdgeList(users)
            };
        },
        user: async (_: unknown, args: GetUserArgs): Promise<User> => {
            const user = await UserService.findOne(Number(args.id), {});
            return user || null;
        }
    },
    Mutation: {
        createUser: async (
            _: unknown,
            { nickname }: CreateUserArgs
        ): Promise<SuccessStatus> => {
            return await UserService.createOne(nickname)
                .then(_ => ({ success: true }))
                .catch(error => ({ success: false, message: error?.message }));
        },

        updateUser: async (
            _: unknown,
            { id, input }: UpdateUserArgs
        ): Promise<SuccessStatus> => {
            const { nickname } = input;
            const updatedUser = await UserService.updateOne(
                Number(id),
                nickname
            );
            const success = updatedUser ? true : false;
            return { success };
        },

        deleteUser: async (
            _: unknown,
            { id }: DeleteUserArgs
        ): Promise<SuccessStatus> => {
            return await UserService.removeOne(Number(id))
                .then(_ => ({ success: true }))
                .catch(_ => ({ success: false }));
        }
    },
    User: {
        petHistory: async (
            parent: User
            // args: { currentOnly: boolean }
        ): Promise<NestedPetHistoryOfUser[]> => {
            const userID = parent.id;
            return await userPetLoader.load(userID);
        }
    }
};
