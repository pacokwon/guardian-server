import { User } from '../model/User';
import {
    UserRepository,
    UserFindAllOptions,
    UserFindOneOptions,
    UserFindAllResult
} from '../repository/UserRepository';
import {
    UserPetHistoryRepository,
    FindHistoryOptions,
    FindPetHistoryResult
} from '../repository/UserPetHistoryRepository';
import { NestedPetHistoryOfUser } from '../model/PetHistoryOfUser';
import { ApiError, Summary } from '../common/error';
import * as RedisCache from '../redis';

const userRepository = new UserRepository();
const userPetHistoryRepository = new UserPetHistoryRepository();

const findAll = async (
    options: UserFindAllOptions
): Promise<UserFindAllResult> => {
    const tag = 'User:FindAll';

    const cached = await RedisCache.read<UserFindAllResult, UserFindAllOptions>(
        { tag, params: options }
    );
    if (cached !== null) return cached;

    const result = await userRepository.findAll(options);
    return await RedisCache.setAndReturn({
        tag,
        params: options,
        value: result
    });
};

const findOne = async (
    id: number,
    options: UserFindOneOptions
): Promise<User> => {
    const tag = `User(${id}):FindOne`;

    const cached = await RedisCache.read<User, UserFindOneOptions>({
        tag,
        params: options
    });
    if (cached !== null) return cached;

    const user = await userRepository.findOne(id, options);
    if (!user) throw new ApiError(Summary.NotFound, 'User not found');

    return await RedisCache.setAndReturn({ tag, params: options, value: user });
};

const findPetHistory = async (
    userID: number,
    options: FindHistoryOptions & { all?: boolean }
): Promise<FindPetHistoryResult> => {
    const tag = `User(${userID}):FindPetHistory`;
    const { all = false, ...restOptions } = options;

    const cached = await RedisCache.read<
        FindPetHistoryResult,
        FindHistoryOptions
    >({
        tag,
        params: options
    });
    if (cached !== null) return cached;

    // query unreleased pets if `all` is false. an empty object queries everything
    const where = all ? {} : { released: 0 };
    const result = await userPetHistoryRepository.findPetHistoryFromUserID(
        userID,
        {
            where,
            ...restOptions
        }
    );

    return await RedisCache.setAndReturn({
        tag,
        params: options,
        value: result
    });
};

const findPetsByUserIDs = async (
    userIDs: readonly number[],
    options?: { currentOnly: boolean }
): Promise<NestedPetHistoryOfUser[][]> => {
    // find *current pets* by default
    const currentOnly = options?.currentOnly ?? true;

    // apply filter if `currentOnly` == true. otherwise, do not use filter
    return userPetHistoryRepository.findPetsByUserIDs(userIDs, {
        where: currentOnly ? { released: 0 } : undefined
    });
};

const createOne = async (nickname: string): Promise<number> => {
    const insertID = await userRepository.insertOne(nickname);

    if (insertID === null)
        throw new ApiError(
            Summary.InternalServerError,
            'Failed to create user'
        );

    await RedisCache.removeBulk([`User:FindAll/*`]);
    return insertID;
};

const updateOne = async (id: number, newNickname: string): Promise<User> => {
    const userExists = (await userRepository.findOne(id, {})) !== undefined;
    if (!userExists) throw new ApiError(Summary.NotFound, 'User not found');

    await userRepository.updateOne(id, {
        nickname: newNickname
    });

    await RedisCache.removeBulk([`User(${id}):*`, 'User:FindAll*']);
    // return modified entry
    return { id, nickname: newNickname };
};

const removeOne = async (id: number): Promise<void> => {
    const userExists = (await userRepository.findOne(id, {})) !== undefined;
    if (!userExists) throw new ApiError(Summary.NotFound, 'User not found');

    await RedisCache.removeBulk([`User(${id}):*`, 'User:FindAll*']);
    await userRepository.removeOne(id);
};

// check for already existing reservation
const registerPet = async (petID: number, userID: number): Promise<void> => {
    const unreleasedPets = await userPetHistoryRepository.find({
        field: ['id'],
        where: { petID, released: 0 }
    });

    const isPetRegistered = unreleasedPets.length !== 0;

    // pet is already taken
    if (isPetRegistered)
        throw new ApiError(
            Summary.BadRequest,
            'Pet is already registered to a user!'
        );

    // the database takes care of foreign key constraints
    await userPetHistoryRepository.insertOne(petID, userID).catch(_ => {
        throw new ApiError(Summary.NotFound, 'Pet or User does not exist!');
    });

    await RedisCache.removeBulk([`User(${userID}):*`, `Pet(${petID}):*`]);
};

const unregisterPet = async (petID: number, userID: number): Promise<void> => {
    // the database takes care of foreign key constraints
    await userPetHistoryRepository.update({
        set: { released: 1 },
        where: { petID, userID, released: 0 }
    });
};

export {
    findAll,
    findOne,
    findPetHistory,
    findPetsByUserIDs,
    createOne,
    updateOne,
    removeOne,
    registerPet,
    unregisterPet
};
