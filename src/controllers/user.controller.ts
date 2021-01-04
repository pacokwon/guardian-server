import { Request, Response } from 'express';

const getAllUsers = (req: Request, res: Response) => {};
const getUser = (req: Request, res: Response) => {};
const createUser = (req: Request, res: Response) => {};
const modifyUser = (req: Request, res: Response) => {};
const removeUser = (req: Request, res: Response) => {};
const getUserPets = (req: Request, res: Response) => {};
const getUserComments = (req: Request, res: Response) => {};

export {
    getAllUsers,
    getUser,
    createUser,
    modifyUser,
    removeUser,
    getUserPets,
    getUserComments
};
