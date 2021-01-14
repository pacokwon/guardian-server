import { Pet } from '@/model/Pet';
import {
    PetRepository,
    PetCreationFields,
    PetModifiableFields
} from '@/repository/PetRepository';
import { UserPetHistoryRepository } from '@/repository/UserPetHistoryRepository';
import { CustomError } from '@/common/error';
import { UserHistoryOfPet } from '@/repository/UserPetHistoryRepository';

const petRepository = new PetRepository();
const userPetHistoryRepository = new UserPetHistoryRepository();

const findAll = async (): Promise<Pet[]> => {
    return await petRepository.findAll();
};

const findOne = async (id: number): Promise<Pet | undefined> => {
    return await petRepository.findOne(id);
};

const createOne = async (fields: PetCreationFields): Promise<CustomError> => {
    const createdRowsCount = await petRepository.insertOne(fields);

    if (createdRowsCount < 1)
        return { status: 500, message: 'Multiple rows created' };

    return {};
};

const updateOne = async (
    id: number,
    fields: PetModifiableFields
): Promise<Pet | undefined> => {
    try {
        await petRepository.updateOne(id, fields);
    } catch {
        return undefined;
    }

    return { id, ...fields };
};

const removeOne = async (id: number): Promise<CustomError> => {
    const deletedRowsCount = await petRepository.removeOne(id);
    if (deletedRowsCount === 0)
        return { status: 404, message: 'Match not found' };
    else if (deletedRowsCount > 1)
        return { status: 500, message: 'Multiple rows have been deleted' };

    return {};
};

const findUsersHistory = async (petID: number): Promise<UserHistoryOfPet[]> => {
    return await userPetHistoryRepository.findUsersHistoryFromPetID(petID);
};

export { findAll, findOne, findUsersHistory, createOne, updateOne, removeOne };
