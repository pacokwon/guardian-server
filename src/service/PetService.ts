import { Pet } from '@/model/Pet';
import {
    PetRepository,
    PetCreationFields,
    PetModifiableFields
} from '@/repository/PetRepository';

const petRepository = new PetRepository();

const findAll = async (): Promise<Pet[]> => {
    return await petRepository.findAll();
};

const findOne = async (id: number): Promise<Pet | undefined> => {
    const user = await petRepository.findOne(id);
    return user;
};

const createOne = async (fields: PetCreationFields): Promise<void> => {
    await petRepository.insertOne(fields);
};

const updateOne = async (
    id: number,
    fields: PetModifiableFields
): Promise<Pet | undefined> => {
    try {
        await petRepository.updateOne(id, fields);

        // return modified row
        return { id, ...fields };
    } catch {
        return undefined;
    }
};

const removeOne = async (id: number): Promise<void> => {
    await petRepository.removeOne(id);
};

export { findAll, findOne, createOne, updateOne, removeOne };
