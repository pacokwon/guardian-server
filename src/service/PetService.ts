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
import {
    NestedUserHistoryOfPet,
    UserHistoryOfPet
} from '../model/UserHistoryOfPet';
import { ApiError, Summary } from '../common/error';

const petRepository = new PetRepository();
const userPetHistoryRepository = new UserPetHistoryRepository();

const findAll = async (options: PetFindAllOptions): Promise<Pet[]> => {
    return await petRepository.findAll(options);
};

const findOne = async (
    id: number,
    options: PetFindOneOptions
): Promise<Pet> => {
    const pet = await petRepository.findOne(id, options);
    if (!pet) throw new ApiError(Summary.NotFound, 'Pet not found');
    return pet;
};

const findGuardian = async (petID: number): Promise<User | null> => {
    // fetch user history of pet. it should contain one user if user exists currently
    const userHistory = await userPetHistoryRepository.findUserHistoryFromPetID(
        petID,
        { where: { released: 0 } }
    );

    // currently, pet does not have user
    if (userHistory.length === 0) return null;

    const { nickname, userID } = userHistory[0];
    return { nickname, id: userID };
};

const findGuardiansByPetIDs = async (
    petIDs: readonly number[]
): Promise<(User | null)[]> => {
    return userPetHistoryRepository.findGuardiansByPetIDs(petIDs);
};

const findOneWithGuardian = async (
    id: number,
    options: PetFindOneOptions
): Promise<Pet & { guardian: User | null }> => {
    const pet = await findOne(id, options);
    const guardian = await findGuardian(id);

    return { guardian, ...pet };
};

const createOne = async (fields: PetCreationFields): Promise<number> => {
    const insertID = await petRepository.insertOne(fields);

    if (insertID === null)
        throw new ApiError(
            Summary.InternalServerError,
            'Failed to create pet.'
        );

    return insertID;
};

const updateOne = async (
    id: number,
    fields: PetModifiableFields
): Promise<Pet> => {
    const petExists = (await petRepository.findOne(id, {})) !== undefined;
    if (!petExists) throw new ApiError(Summary.NotFound, 'Pet not found');

    await petRepository.updateOne(id, fields);
    return { id, ...fields };
};

const removeOne = async (id: number): Promise<void> => {
    const petExists = (await petRepository.findOne(id, {})) !== undefined;
    if (!petExists) throw new ApiError(Summary.NotFound, 'Pet not found');

    await petRepository.removeOne(id);
};

const findUserHistory = async (
    petID: number,
    options: FindHistoryOptions
): Promise<UserHistoryOfPet[]> => {
    return await userPetHistoryRepository.findUserHistoryFromPetID(
        petID,
        options
    );
};

const findUsersByPetIDs = async (
    userIDs: readonly number[]
): Promise<NestedUserHistoryOfPet[][]> => {
    return userPetHistoryRepository.findUsersByPetIDs(userIDs);
};

export {
    findAll,
    findOne,
    findOneWithGuardian,
    findGuardian,
    findGuardiansByPetIDs,
    findUserHistory,
    findUsersByPetIDs,
    createOne,
    updateOne,
    removeOne
};
