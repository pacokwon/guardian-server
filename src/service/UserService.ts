import { User } from '@/model/User';
import { UserRepository } from '@/repository/UserRepository';
import { UserPetHistoryRepository } from '@/repository/UserPetHistoryRepository';
import { PetHistoryOfUser } from '@/repository/UserPetHistoryRepository';
import { CustomError } from '@/common/error';

const userRepository = new UserRepository();
const userPetHistoryRepository = new UserPetHistoryRepository();

const findAll = async (): Promise<User[]> => {
    return await userRepository.findAll();
};

const findOne = async (id: number): Promise<User | undefined> => {
    const user = await userRepository.findOne(id);
    return user;
};

const findPetsHistory = async (userID: number): Promise<PetHistoryOfUser[]> => {
    return await userPetHistoryRepository.findPetsHistoryFromUserID(userID);
};

const createOne = async (nickname: string): Promise<CustomError> => {
    const createdRowsCount = await userRepository.insertOne(nickname);

    if (createdRowsCount < 1)
        return { status: 500, message: 'Multiple rows created' };

    return {};
};

const updateOne = async (
    id: number,
    newNickname: string
): Promise<User | undefined> => {
    try {
        await userRepository.updateOne(id, { nickname: newNickname });

        // return modified entry
        return { id, nickname: newNickname };
    } catch {
        return undefined;
    }
};

const removeOne = async (id: number): Promise<CustomError> => {
    const deletedRowsCount = await userRepository.removeOne(id);

    if (deletedRowsCount === 0)
        return { status: 400, message: 'No match found' };
    else if (deletedRowsCount > 1)
        return { status: 500, message: 'Multiple rows deleted' };

    return {};
};

// check for already existing reservation
const registerUser = async (
    petID: number,
    userID: number
): Promise<CustomError> => {
    const unreleasedPetRows = await userPetHistoryRepository.find({
        select: ['id'],
        where: { petID, released: 0 }
    });

    const isPetRegistered = unreleasedPetRows.length !== 0;

    // pet is already taken
    if (isPetRegistered)
        return { message: 'Pet is already registered to a user!', status: 400 };

    // the database takes care of foreign key constraints
    return await userPetHistoryRepository
        .insertOne(petID, userID)
        .then(() => ({}))
        .catch(_ => ({
            message: 'Pet or User does not exist!',
            status: 404
        }));
};

const unregisterUser = async (
    petID: number,
    userID: number
): Promise<CustomError> => {
    // the database takes care of foreign key constraints
    const error = await userPetHistoryRepository
        .update({ set: { released: 1 }, where: { petID, userID, released: 0 } })
        .then(changedRows => {
            if (changedRows === 0)
                return {
                    message: 'Match not found',
                    status: 404
                };
            else if (changedRows > 1)
                return {
                    message: 'Multiple rows have changed',
                    status: 500
                };
            return {};
        })
        .catch(() => ({
            message: 'Internal Server Error',
            status: 500
        }));

    return error;
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
