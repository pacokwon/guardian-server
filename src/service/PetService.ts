import { Pet } from '@/model/Pet';
import {
    PetRepository,
    PetCreationFields,
    PetModifiableFields,
    PetFindAllOptions,
    PetFindOneOptions
} from '@/repository/PetRepository';
import {
    UserPetHistoryRepository,
    FindHistoryOptions
} from '@/repository/UserPetHistoryRepository';
import { ApiError, CustomError } from '@/common/error';
import { UserHistoryOfPet } from '@/repository/UserPetHistoryRepository';

const petRepository = new PetRepository();
const userPetHistoryRepository = new UserPetHistoryRepository();

const findAll = async (options: PetFindAllOptions): Promise<Pet[]> => {
    return await petRepository.findAll(options);
};

const findOne = async (
    id: number,
    options: PetFindOneOptions
): Promise<Pet | undefined> => {
    return await petRepository.findOne(id, options);
};

const createOne = async (fields: PetCreationFields): Promise<number> => {
    const insertID = await petRepository.insertOne(fields);

    if (insertID === null) throw new ApiError(500, 'Failed to create pet.');

    return insertID;
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

const findUsersHistory = async (
    petID: number,
    options: FindHistoryOptions
): Promise<UserHistoryOfPet[]> => {
    return await userPetHistoryRepository.findUsersHistoryFromPetID(
        petID,
        options
    );
};

export { findAll, findOne, findUsersHistory, createOne, updateOne, removeOne };
