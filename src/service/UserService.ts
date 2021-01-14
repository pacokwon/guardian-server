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
        return { status: 500, message: 'More than 1 row created' };

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
        return { status: 500, message: 'More than 1 row has been deleted' };

    return {};
};

export { findAll, findOne, findPetsHistory, createOne, updateOne, removeOne };
