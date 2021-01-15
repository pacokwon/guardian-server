import { IResolvers } from 'graphql-tools';
import { User } from '@/model/User';
import { ApiError } from '@/common/error';
import * as UserService from '@/service/UserService';
import {
    QueryUserArgs,
    CreateUserArgs,
    UpdateUserArgs,
    DeleteUserArgs,
    SuccessStatus,
    UserUpdateInput
} from '@/graphql/type/user.type';

export const userResolver: IResolvers = {
    Query: {
        users: async (): Promise<User[]> => {
            const users = await UserService.findAll();
            return users;
        },

        user: async (_: unknown, args: QueryUserArgs): Promise<User | null> => {
            const user = await UserService.findOne(Number(args.id));
            return user || null;
        }
    },
    Mutation: {
        createUser: async (
            _: unknown,
            { nickname }: CreateUserArgs
        ): Promise<SuccessStatus> => {
            const { message } = await UserService.createOne(nickname);
            const success = message ? true : false;
            return { success, message };
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
        }
    }
};
