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

const userRepository = new UserRepository();
const userPetHistoryRepository = new UserPetHistoryRepository();

const findAll = async (
    options: UserFindAllOptions
): Promise<UserFindAllResult> => {
    return await userRepository.findAll(options);
};

const findOne = async (
    id: number,
    options: UserFindOneOptions
): Promise<User> => {
    const user = await userRepository.findOne(id, options);
    if (!user) throw new ApiError(Summary.NotFound, 'User not found');
    return user;
};

const findPetHistory = async (
    userID: number,
    options: FindHistoryOptions & { all?: boolean }
): Promise<FindPetHistoryResult> => {
    const { all = false, ...restOptions } = options;

    // query unreleased pets if `all` is false. an empty object queries everything
    const where = all ? {} : { released: 0 };
    return await userPetHistoryRepository.findPetHistoryFromUserID(userID, {
        where,
        ...restOptions
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

    return insertID;
};

const updateOne = async (id: number, newNickname: string): Promise<User> => {
    const userExists = (await userRepository.findOne(id, {})) !== undefined;
    if (!userExists) throw new ApiError(Summary.NotFound, 'User not found');

    await userRepository.updateOne(id, {
        nickname: newNickname
    });
    // return modified entry
    return { id, nickname: newNickname };
};

const removeOne = async (id: number): Promise<void> => {
    const userExists = (await userRepository.findOne(id, {})) !== undefined;
    if (!userExists) throw new ApiError(Summary.NotFound, 'User not found');

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
