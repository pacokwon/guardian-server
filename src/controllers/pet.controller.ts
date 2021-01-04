import { Request, Response } from 'express';

const getAllPets = (req: Request, res: Response) => {};
const getPet = (req: Request, res: Response) => {};
const createPet = (req: Request, res: Response) => {};
const modifyPet = (req: Request, res: Response) => {};
const removePet = (req: Request, res: Response) => {};
const getPetComments = (req: Request, res: Response) => {};
const createPetComments = (req: Request, res: Response) => {};

export {
    getAllPets,
    getPet,
    createPet,
    modifyPet,
    removePet,
    getPetComments,
    createPetComments
};
