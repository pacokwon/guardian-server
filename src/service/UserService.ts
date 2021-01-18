import { User } from '@/model/User';
import {
    UserRepository,
    FindAllOptions,
    FindOneOptions
} from '@/repository/UserRepository';
import {
    UserPetHistoryRepository,
    FindHistoryOptions
} from '@/repository/UserPetHistoryRepository';
import { PetHistoryOfUser } from '@/repository/UserPetHistoryRepository';
import { ApiError } from '@/common/error';

const userRepository = new UserRepository();
const userPetHistoryRepository = new UserPetHistoryRepository();

const findAll = async (options: FindAllOptions): Promise<User[]> => {
    return await userRepository.findAll(options);
};

const findOne = async (id: number, options: FindOneOptions): Promise<User> => {
    const user = await userRepository.findOne(id, options);
    if (!user) throw new ApiError(404, 'User not found');
    return user;
};

const findPetsHistory = async (
    userID: number,
    options: FindHistoryOptions
): Promise<PetHistoryOfUser[]> => {
    return await userPetHistoryRepository.findPetsHistoryFromUserID(
        userID,
        options
    );
};

const createOne = async (nickname: string): Promise<number> => {
    const insertID = await userRepository.insertOne(nickname);

    if (insertID === null) throw new ApiError(500, 'Failed to create user');

    return insertID;
};

const updateOne = async (id: number, newNickname: string): Promise<User> => {
    const userExists = (await userRepository.findOne(id, {})) !== undefined;
    if (!userExists) throw new ApiError(404, 'User not found');

    const changedRows = await userRepository.updateOne(id, {
        nickname: newNickname
    });
    if (changedRows > 1)
        throw new ApiError(500, 'Multiple rows have been updated');

    // return modified entry
    return { id, nickname: newNickname };
};

const removeOne = async (id: number): Promise<void> => {
    const userExists = (await userRepository.findOne(id, {})) !== undefined;
    if (!userExists) throw new ApiError(404, 'User not found');

    const deletedRowsCount = await userRepository.removeOne(id);

    if (deletedRowsCount === 0) throw new ApiError(404, 'User not found');
    else if (deletedRowsCount > 1)
        throw new ApiError(500, 'Multiple rows deleted');
};

// check for already existing reservation
const registerUser = async (petID: number, userID: number): Promise<void> => {
    const unreleasedPetRows = await userPetHistoryRepository.find({
        field: ['id'],
        where: { petID, released: 0 }
    });

    const isPetRegistered = unreleasedPetRows.length !== 0;

    // pet is already taken
    if (isPetRegistered)
        throw new ApiError(400, 'Pet is already registered to a user!');

    // the database takes care of foreign key constraints
    await userPetHistoryRepository.insertOne(petID, userID).catch(_ => {
        throw new ApiError(404, 'Pet or User does not exist!');
    });
};

const unregisterUser = async (petID: number, userID: number): Promise<void> => {
    // the database takes care of foreign key constraints
    const changedRows = await userPetHistoryRepository
        .update({ set: { released: 1 }, where: { petID, userID, released: 0 } })
        .catch(() => {
            throw new ApiError(500, 'Internal Server Error');
        });

    if (changedRows === 0) throw new ApiError(404, 'User not found');
    else if (changedRows > 1)
        throw new ApiError(500, 'Multiple rows have changed');
};

export {
    findAll,
    findOne,
    findPetsHistory,
    createOne,
    updateOne,
    removeOne,
    registerUser,
    unregisterUser
};
