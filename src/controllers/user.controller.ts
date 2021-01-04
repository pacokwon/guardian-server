import { Request, Response } from 'express';
import * as UserService from '@/services/UserService';

interface CreateUserBody {
    username: string;
}

interface ModifyUserBody {
    username: string;
}

const getAllUsers = async (_: Request, res: Response): Promise<void> => {
    const users = await UserService.getAll();
    res.json({ users });
};

const getUser = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const user = await UserService.getSingleUser(id);

    const statusCode = user ? 200 : 400;
    res.status(statusCode).json({ user });
};

const createUser = async (
    req: Request<
        Record<string, never>,
        Record<string, unknown>,
        CreateUserBody
    >,
    res: Response
): Promise<void> => {
    const { username } = req.body;

    const userExists = await UserService.exists(username);

    if (userExists) {
        res.status(400).json({ success: false });
        return;
    }

    await UserService.createUser(username);
    res.json({ success: true });
};

const modifyUser = async (
    req: Request<
        Record<string, string>,
        Record<string, unknown>,
        ModifyUserBody
    >,
    res: Response
): Promise<void> => {
    const { username: newUsername } = req.body;
    const { id: oldUsername } = req.params;

    // as of now, the only modifiable data in a user is the username
    const success = await UserService.modifyUsername(oldUsername, newUsername);

    const statusCode = success ? 200 : 400;
    res.status(statusCode).json({ success });
};

const removeUser = async (
    req: Request<
        Record<string, string>,
        Record<string, unknown>,
        Record<string, never>
    >,
    res: Response
): Promise<void> => {
    const { id } = req.params;
    const success = await UserService.removeUser(id);

    const statusCode = success ? 200 : 400;
    res.status(statusCode).json({ success });
};

const getUserPets = async (req: Request, res: Response): Promise<void> => {};

const getUserComments = async (
    req: Request,
    res: Response
): Promise<void> => {};

export {
    getAllUsers,
    getUser,
    createUser,
    modifyUser,
    removeUser,
    getUserPets,
    getUserComments
};
