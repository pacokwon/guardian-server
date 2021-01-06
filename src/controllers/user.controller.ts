import { Controller, Route, Get, Post, Put, Delete, Path, Body } from 'tsoa';
import { IUser } from '@/entities/User';
import * as UserService from '@/services/UserService';

@Route('user')
export class UserController extends Controller {
    @Get()
    async getAllUsers(): Promise<IUser[]> {
        const users = await UserService.getAll();

        this.setStatus(200);
        return users;
    }

    @Get('{id}')
    async getUser(@Path() id: number): Promise<IUser | null> {
        const user = await UserService.getSingleUser(id);

        const statusCode = user ? 200 : 400;
        this.setStatus(statusCode);

        return user;
    }

    @Post()
    async createUser(@Body() nickname: string): Promise<void> {
        await UserService.createUser(nickname);
        this.setStatus(200);
    }

    @Put('{id}')
    async modifyUser(
        @Body() nickname: string,
        @Path() id: number
    ): Promise<{ success: boolean }> {
        // as of now, the only modifiable data in a user is the nickname
        const success = await UserService.modifyNickname(id, nickname);

        const statusCode = success ? 200 : 400;
        this.setStatus(statusCode);
        return { success };
    }

    async removeUser(@Path() id: number): Promise<{ success: boolean }> {
        const success = await UserService.removeUser(id);

        const statusCode = success ? 200 : 400;
        this.setStatus(statusCode);
        return { success };
    }

    async getUserPets(): Promise<void> {}
}
