import { Pet } from '../model/Pet';
import { User } from '../model/User';
import {
    PetRepository,
    PetCreationFields,
    PetModifiableFields,
    PetFindAllOptions,
    PetFindOneOptions,
    PetFindAllResult
} from '../repository/PetRepository';
import {
    UserPetHistoryRepository,
    FindHistoryOptions,
    FindUserHistoryResult
} from '../repository/UserPetHistoryRepository';
import { NestedUserHistoryOfPet } from '../model/UserHistoryOfPet';
import { ApiError, Summary } from '../common/error';
import { clearUndefinedFields } from '../common/utils';
import * as RedisCache from '../redis';

const petRepository = new PetRepository();
const userPetHistoryRepository = new UserPetHistoryRepository();

const findAll = async (
    options: PetFindAllOptions
): Promise<PetFindAllResult> => {
    const tag = 'Pet:FindAll';

    const cached = await RedisCache.read<PetFindAllResult, PetFindAllOptions>({
        tag,
        params: options
    });
    if (cached !== null) return cached;

    const result = await petRepository.findAll(options);
    return RedisCache.setAndReturn({
        tag,
        params: options,
        value: result
    });
};

const findOne = async (
    id: number,
    options: PetFindOneOptions
): Promise<Pet> => {
    const tag = `Pet(${id}):FindOne`;

    const cached = await RedisCache.read<Pet, PetFindOneOptions>({
        tag,
        params: options
    });
    if (cached !== null) return cached;

    const pet = await petRepository.findOne(id, options);
    if (!pet) throw new ApiError(Summary.NotFound, 'Pet not found');
    return RedisCache.setAndReturn({
        tag,
        params: options,
        value: pet
    });
};

const findGuardian = async (petID: number): Promise<User | null> => {
    const tag = `Pet(${petID}):FindGuardian`;

    const cached = await RedisCache.read<User | null, Record<string, never>>({
        tag,
        params: {}
    });
    if (cached !== null) return cached;

    // fetch user history of pet. it should contain one user if user exists currently
    const {
        userHistory
    } = await userPetHistoryRepository.findUserHistoryFromPetID(petID, {
        where: { released: 0 }
    });

    // currently, pet does not have user
    if (userHistory.length === 0)
        return RedisCache.setAndReturn({
            tag,
            params: {},
            value: null
        });

    const { nickname, userID } = userHistory[0];
    return RedisCache.setAndReturn({
        tag,
        params: {},
        value: { nickname, id: userID }
    });
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
    // these two functions below already use caching
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

    await RedisCache.removeBulk([`Pet:FindAll/*`]);
    return insertID;
};

const updateOne = async (
    id: number,
    _fields: PetModifiableFields
): Promise<Pet> => {
    const pet = await petRepository.findOne(id, {});
    const petExists = pet !== undefined;
    if (!petExists) throw new ApiError(Summary.NotFound, 'Pet not found');

    const fields = clearUndefinedFields(_fields);

    await petRepository.updateOne(id, fields);
    await RedisCache.removeBulk([`Pet(${id}):*`, 'Pet:FindAll*']);

    return { ...(pet as Pet), ...fields }; // type assertion; pet must not be undefined
};

const removeOne = async (id: number): Promise<void> => {
    const petExists = (await petRepository.findOne(id, {})) !== undefined;
    if (!petExists) throw new ApiError(Summary.NotFound, 'Pet not found');

    await RedisCache.removeBulk([`Pet(${id}):*`, 'Pet:FindAll*']);
    await petRepository.removeOne(id);
};

const findUserHistory = async (
    petID: number,
    options: FindHistoryOptions
): Promise<FindUserHistoryResult> => {
    const tag = `Pet(${petID}):FindUserHistory`;

    const cached = await RedisCache.read<
        FindUserHistoryResult,
        FindHistoryOptions
    >({
        tag,
        params: options
    });
    if (cached !== null) return cached;

    const result = await userPetHistoryRepository.findUserHistoryFromPetID(
        petID,
        options
    );

    return RedisCache.setAndReturn({
        tag,
        params: options,
        value: result
    });
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
