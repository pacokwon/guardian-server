import { IResolvers } from 'graphql-tools';
import { User } from '../../model/User';
import * as UserService from '../../service/UserService';
import {
    ListUserArgs,
    GetUserArgs,
    CreateUserArgs,
    UpdateUserArgs,
    DeleteUserArgs,
    SuccessStatus
} from '../type/user.type';

export const userResolver: IResolvers = {
    Query: {
        users: async (_: unknown, args: ListUserArgs): Promise<User[]> => {
            const users = await UserService.findAll(args);
            return users;
        },

        user: async (_: unknown, args: GetUserArgs): Promise<User | null> => {
            const user = await UserService.findOne(Number(args.id), {});
            return user || null;
        }
    },
    Mutation: {
        createUser: async (
            _: unknown,
            { nickname }: CreateUserArgs
        ): Promise<SuccessStatus> => {
            try {
                await UserService.createOne(nickname);
            } catch (error) {
                return { success: false, message: error.message };
            }
            return { success: true };
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
            try {
                await UserService.removeOne(Number(id));
            } catch {
                return { success: false };
            }

            return { success: true };
        }
    }
};
