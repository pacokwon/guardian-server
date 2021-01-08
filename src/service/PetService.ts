import { Pet } from '@/model/Pet';
import {
    PetRepository,
    PetCreationFields,
    PetModifiableFields
} from '@/repository/PetRepository';

const petRepository = new PetRepository();

const getAllPets = async (): Promise<Pet[]> => {
    return await petRepository.findAll();
};

const getSinglePet = async (id: number): Promise<Pet | undefined> => {
    const user = await petRepository.findOne(id);
    return user;
};

const createPet = async (fields: PetCreationFields): Promise<void> => {
    await petRepository.insertOne(fields);
};

const modifyPet = async (
    id: number,
    fields: PetModifiableFields
): Promise<boolean> => {
    try {
        await petRepository.updateOne(id, fields);
    } catch {
        return false;
    }

    return true;
};

const removePet = async (id: number): Promise<boolean> => {
    try {
        await petRepository.removeOne(id);
    } catch {
        return false;
    }

    return true;
};

export { getAllPets, getSinglePet, createPet, modifyPet, removePet };
