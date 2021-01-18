import { Pet } from '../model/Pet';
import { User } from '../model/User';
import {
    PetRepository,
    PetCreationFields,
    PetModifiableFields,
    PetFindAllOptions,
    PetFindOneOptions
} from '../repository/PetRepository';
import {
    UserPetHistoryRepository,
    FindHistoryOptions
} from '../repository/UserPetHistoryRepository';
import { ApiError } from '../common/error';
import { UserHistoryOfPet } from '../repository/UserPetHistoryRepository';

const petRepository = new PetRepository();
const userPetHistoryRepository = new UserPetHistoryRepository();

const findAll = async (options: PetFindAllOptions): Promise<Pet[]> => {
    return await petRepository.findAll(options);
};

const findOne = async (
    id: number,
    options: PetFindOneOptions
): Promise<Pet & { user?: User }> => {
    const pet = await petRepository.findOne(id, options);
    if (!pet) throw new ApiError(404, 'Pet not found');

    // fetch user history of pet. it should contain one user if user exists currently
    const userHistory = await userPetHistoryRepository.findUsersHistoryFromPetID(
        id,
        {
            where: { released: 0 }
        }
    );

    // currently, pet does not have user
    if (userHistory.length === 0) return pet;

    const { nickname, userID } = userHistory[0];
    return { ...pet, user: { nickname, id: userID } };
};

const createOne = async (fields: PetCreationFields): Promise<number> => {
    const insertID = await petRepository.insertOne(fields);

    if (insertID === null) throw new ApiError(500, 'Failed to create pet.');

    return insertID;
};

const updateOne = async (
    id: number,
    fields: PetModifiableFields
): Promise<Pet> => {
    const petExists = (await petRepository.findOne(id, {})) !== undefined;
    if (!petExists) throw new ApiError(404, 'Pet not found');

    const changedRows = await petRepository.updateOne(id, fields);
    if (changedRows > 1)
        throw new ApiError(500, 'Multiple rows have been updated');

    return { id, ...fields };
};

const removeOne = async (id: number): Promise<void> => {
    const petExists = (await petRepository.findOne(id, {})) !== undefined;
    if (!petExists) throw new ApiError(404, 'Pet not found');

    const deletedRowsCount = await petRepository.removeOne(id);
    if (deletedRowsCount === 0) throw new ApiError(404, 'Pet not found');
    else if (deletedRowsCount > 1)
        throw new ApiError(500, 'Multiple rows have been deleted');
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
